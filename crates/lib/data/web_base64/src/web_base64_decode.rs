use base64::prelude::BASE64_STANDARD;
use base64::Engine;

pub fn web_base64_decode(base64_string: &str) -> Result<Vec<u8>, base64::DecodeError> {
  // Strip the data URI header if present. Preserve the *entire* payload:
  // splitting at every comma would silently ignore malformed trailing data.
  let base64_data = if base64_string.starts_with("data:") {
    base64_string
      .split_once(',')
      .map(|(_, data)| data)
      .unwrap_or(base64_string)
  } else {
    base64_string
  };

  BASE64_STANDARD.decode(base64_data)
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn decodes_rfc4648_vectors_and_empty_input() {
    for (encoded, expected) in [
      ("", "".as_bytes()),
      ("Zg==", "f".as_bytes()),
      ("Zm8=", "fo".as_bytes()),
      ("Zm9v", "foo".as_bytes()),
      ("Zm9vYg==", "foob".as_bytes()),
      ("Zm9vYmE=", "fooba".as_bytes()),
      ("Zm9vYmFy", "foobar".as_bytes()),
    ] {
      assert_eq!(web_base64_decode(encoded).unwrap(), expected);
    }
  }

  #[test]
  fn decodes_binary_data_uri_without_losing_bytes() {
    assert_eq!(
      web_base64_decode("data:image/png;base64,AAEC/w==").unwrap(),
      vec![0, 1, 2, 255],
    );
  }

  #[test]
  fn rejects_a_second_comma_in_data_uri_instead_of_ignoring_trailing_data() {
    assert!(web_base64_decode("data:image/png;base64,SGVsbG8=,ignored").is_err());
    assert!(web_base64_decode("data:image/png;base64,SGVsbG8=,").is_err());
  }

  #[test]
  fn rejects_malformed_base64_and_incomplete_data_uris() {
    for malformed in [
      "SGVsbG8",
      "SGVsbG8===",
      "SGV sbG8=",
      "data:image/png;base64",
      "data:image/png;base64,%%%",
    ] {
      assert!(web_base64_decode(malformed).is_err(), "unexpectedly accepted: {malformed}");
    }
  }

  #[test]
  fn losslessly_decodes_every_possible_byte() {
    let original: Vec<u8> = (0..=255).collect();
    let encoded = BASE64_STANDARD.encode(&original);
    assert_eq!(web_base64_decode(&encoded).unwrap(), original);
  }
}
