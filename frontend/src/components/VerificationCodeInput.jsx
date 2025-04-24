import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./VerificationCodeInput.css";

const VerificationCodeInput = ({ length = 6, onChange, autoFocus = true }) => {
  const [code, setCode] = useState(Array(length).fill(""));
  const inputs = useRef([]);

  useEffect(() => {
    if (autoFocus && inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    onChange(newCode.join(""));

    if (value && index < length - 1 && inputs.current[index + 1]) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (code[index] === "") {
        if (index > 0 && inputs.current[index - 1]) {
          inputs.current[index - 1].focus();
          const newCode = [...code];
          newCode[index - 1] = "";
          setCode(newCode);
          onChange(newCode.join(""));
        }
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
        onChange(newCode.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    const digits = pastedData.replace(/[^\d]/g, "").slice(0, length).split("");

    if (digits.length > 0) {
      const newCode = [...code];
      digits.forEach((digit, idx) => {
        if (idx < length) {
          newCode[idx] = digit;
        }
      });

      setCode(newCode);
      onChange(newCode.join(""));

      const nextEmptyIndex = newCode.findIndex((digit) => digit === "");
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;

      if (inputs.current[focusIndex]) {
        inputs.current[focusIndex].focus();
      }
    }
  };

  return (
    <div className="verification-container">
      
      
      <div className="verification-input-section">
        <div className="verification-code-input-container">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="verification-digit-input"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

VerificationCodeInput.propTypes = {
  length: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  autoFocus: PropTypes.bool,
};

export default VerificationCodeInput;