use crate::error::JwtError;

const SEPARATOR: &str = ".";

pub fn split_components(token: &str) -> Result<[&str; 3], JwtError> {
  let mut components = token.split(SEPARATOR);
  let header = components.next()
      .ok_or_else(|| jwt_error("no header component"))?;

  let claims = components.next()
      .ok_or_else(|| jwt_error("no claims component"))?;

  let signature = components.next()
      .ok_or_else(|| jwt_error("no signature component"))?;

  if components.next().is_some() {
    return Err(jwt_error("too many components"));
  }

  Ok([header, claims, signature])
}

fn jwt_error(reason: &str) -> JwtError {
  JwtError::ParseError(reason.to_string())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn preserves_all_three_components_verbatim() {
    assert_eq!(split_components("header.payload.signature").unwrap(), ["header", "payload", "signature"]);
  }

  #[test]
  fn rejects_missing_and_extra_components() {
    for invalid in ["", "header", "header.payload", "header.payload.signature.extra"] {
      assert!(split_components(invalid).is_err(), "unexpectedly accepted {invalid:?}");
    }
  }

  #[test]
  fn splitting_does_not_claim_to_validate_signature_or_content() {
    // This helper only splits a string. The crate must never be used
    // as cryptographic JWT signature verification.
    assert_eq!(split_components(".payload.").unwrap(), ["", "payload", ""]);
  }
}
