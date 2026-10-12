use std::fs;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};

use filesys::file_deletion::safe_delete_files_and_directories::safe_delete_files_and_directories;
use filesys::file_deletion::safe_recursively_delete_files::safe_recursively_delete_files;
use filesys::rename_across_devices::{RenameError, rename_across_devices};

#[test]
fn recursive_file_cleanup_keeps_directories_and_preserves_unrelated_files() {
  let temp = temporary_directory();
  let root = temp.path().join("cleanup");
  let nested = root.join("nested");
  fs::create_dir_all(&nested).unwrap();
  fs::write(root.join("first.txt"), b"first").unwrap();
  fs::write(nested.join("second.txt"), b"second").unwrap();
  fs::write(temp.path().join("unrelated.txt"), b"keep").unwrap();

  safe_recursively_delete_files(&root);
  safe_recursively_delete_files(&root);

  assert!(root.is_dir());
  assert!(nested.is_dir());
  assert!(!root.join("first.txt").exists());
  assert!(!nested.join("second.txt").exists());
  assert_eq!(fs::read(temp.path().join("unrelated.txt")).unwrap(), b"keep");
}

#[test]
fn recursive_cleanup_rejects_file_input_without_deleting_it() {
  let temp = temporary_directory();
  let file = temp.path().join("important.txt");
  fs::write(&file, b"keep").unwrap();

  safe_recursively_delete_files(&file);
  safe_recursively_delete_files(&temp.path().join("missing"));

  assert_eq!(fs::read(&file).unwrap(), b"keep");
}

#[test]
fn bulk_cleanup_is_idempotent_for_files_and_directories() {
  let temp = temporary_directory();
  let file = temp.path().join("delete.txt");
  let directory = temp.path().join("delete-directory");
  fs::create_dir(&directory).unwrap();
  fs::write(&file, b"delete").unwrap();
  fs::write(directory.join("nested.txt"), b"delete").unwrap();
  let targets = [&file, &directory];

  safe_delete_files_and_directories(&targets);
  safe_delete_files_and_directories(&targets);

  assert!(!file.exists());
  assert!(!directory.exists());
  assert!(temp.path().exists());
}

#[test]
fn rename_moves_exact_bytes_and_removes_source() {
  let temp = temporary_directory();
  let source = temp.path().join("source.dat");
  let target = temp.path().join("target.dat");
  let bytes: Vec<u8> = (0..=255).collect();
  fs::write(&source, &bytes).unwrap();

  rename_across_devices(&source, &target).unwrap();

  assert!(!source.exists());
  assert_eq!(fs::read(&target).unwrap(), bytes);
}

#[test]
fn failed_rename_does_not_modify_an_existing_destination() {
  let temp = temporary_directory();
  let missing = temp.path().join("missing.dat");
  let target = temp.path().join("target.dat");
  fs::write(&target, b"existing").unwrap();

  let result = rename_across_devices(&missing, &target);

  assert!(matches!(result, Err(RenameError::IoError(ref e)) if e.kind() == ErrorKind::NotFound));
  assert_eq!(fs::read(&target).unwrap(), b"existing");
}

#[cfg(unix)]
#[test]
fn recursive_cleanup_does_not_follow_symlink_outside_the_target_directory() {
  use std::os::unix::fs::symlink;

  let temp = temporary_directory();
  let root = temp.path().join("cleanup");
  let outside = temp.path().join("outside");
  fs::create_dir_all(&root).unwrap();
  fs::create_dir_all(&outside).unwrap();
  fs::write(outside.join("protected.dat"), b"keep").unwrap();
  symlink(&outside, root.join("linked-outside")).unwrap();

  safe_recursively_delete_files(&root);

  assert_eq!(fs::read(outside.join("protected.dat")).unwrap(), b"keep");
}

static NEXT_TEMP_ID: AtomicUsize = AtomicUsize::new(0);

struct IsolatedTempDirectory(PathBuf);

impl IsolatedTempDirectory {
  fn path(&self) -> &Path {
    &self.0
  }
}

impl Drop for IsolatedTempDirectory {
  fn drop(&mut self) {
    let _ = fs::remove_dir_all(&self.0);
  }
}

fn temporary_directory() -> IsolatedTempDirectory {
  loop {
    // Test isolation is based on exclusively creating a new directory,
    // not guessing that a pre-existing path is safe to remove.
    let id = NEXT_TEMP_ID.fetch_add(1, Ordering::Relaxed);
    let path = std::env::temp_dir().join(format!(
      "artcraft-filesys-tests-{}-{}",
      std::process::id(),
      id,
    ));
    match fs::create_dir(&path) {
      Ok(()) => return IsolatedTempDirectory(path),
      Err(e) if e.kind() == ErrorKind::AlreadyExists => continue,
      Err(e) => panic!("Cannot create isolated test directory: {e}"),
    }
  }
}
