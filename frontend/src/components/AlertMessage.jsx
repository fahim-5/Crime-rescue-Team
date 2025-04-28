import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./AlertMessage.css";

const AlertMessage = ({
  type = "info",
  message,
  duration = 3000,
  onClose,
  showIcon = true,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;

    setVisible(true);

    let timer;
    if (duration > 0) {
      timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message, duration, onClose]);

  if (!message || !visible) return null;

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const getAlertClass = () => {
    switch (type) {
      case "success":
        return "alert-success";
      case "error":
        return "alert-error";
      case "warning":
        return "alert-warning";
      default:
        return "alert-info";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      default:
        return "ℹ";
    }
  };

  return (
    <div className={`alert-container ${getAlertClass()}`}>
      {showIcon && <span className="alert-icon">{getIcon()}</span>}
      <div className="alert-message">{message}</div>
      <button className="alert-close" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};

AlertMessage.propTypes = {
  type: PropTypes.oneOf(["success", "error", "info", "warning"]),
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onClose: PropTypes.func,
  showIcon: PropTypes.bool,
};

export default AlertMessage;
