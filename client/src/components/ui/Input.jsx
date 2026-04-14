import s from './Input.module.css';

const Input = ({ label, error, helperText, icon, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={s.group}>
      {label && (
        <label htmlFor={inputId} className={s.label}>
          {label}
        </label>
      )}
      <div className={s.inputWrapper}>
        {icon && <div className={s.icon}>{icon}</div>}
        <input
          id={inputId}
          className={`${icon ? s.inputWithIcon : s.input} ${error ? s.inputError : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className={s.errorText}>{error}</p>}
      {helperText && !error && <p className={s.helperText}>{helperText}</p>}
    </div>
  );
};

const Select = ({ label, error, helperText, icon, children, className = '', id, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={s.group}>
      {label && (
        <label htmlFor={selectId} className={s.label}>
          {label}
        </label>
      )}
      <div className={s.inputWrapper}>
        {icon && <div className={s.icon}>{icon}</div>}
        <select
          id={selectId}
          className={`${icon ? s.selectWithIcon : s.select} ${error ? s.inputError : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className={s.selectArrow}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 5l4 4 4-4" />
          </svg>
        </div>
      </div>
      {error && <p className={s.errorText}>{error}</p>}
      {helperText && !error && <p className={s.helperText}>{helperText}</p>}
    </div>
  );
};

export { Input, Select };
export default Input;
