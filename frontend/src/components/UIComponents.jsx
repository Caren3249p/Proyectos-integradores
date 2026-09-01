import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none select-none";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3.5 gap-2.5"
  };

  const variantStyles = {
    primary: "bg-[#C8102E] hover:bg-[#A60D26] text-white shadow-md hover:shadow-lg hover:shadow-[#C8102E]/20 hover:-translate-y-0.5",
    secondary: "bg-white hover:bg-neutral-50 text-[#1A1A1A] border border-neutral-200/80 shadow-sm hover:shadow hover:-translate-y-0.5",
    outline: "border-2 border-[#C8102E] text-[#C8102E] hover:bg-[#C8102E]/5 hover:-translate-y-0.5",
    gold: "bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] hover:from-[#B8973B] hover:to-[#C5A028] text-white shadow-md hover:shadow-[#C9A84C]/30 hover:-translate-y-0.5",
    ghost: "text-[#555555] hover:text-[#1A1A1A] hover:bg-black/5",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={baseStyles + " " + sizeStyles[size] + " " + variantStyles[variant] + " " + className}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export const Badge = ({
  status = 'activo',
  children,
  className = '',
  dot = true
}) => {
  const styles = {
    borrador: "bg-neutral-100 text-neutral-700 border-neutral-200",
    activo: "bg-emerald-50 text-emerald-700 border-emerald-200/60 shadow-emerald-500/10",
    en_revision: "bg-amber-50 text-amber-700 border-amber-200/60 shadow-amber-500/10",
    calificado: "bg-indigo-50 text-indigo-700 border-indigo-200/60 shadow-indigo-500/10",
    cerrada: "bg-purple-50 text-purple-700 border-purple-200/60",
    gold: "bg-[#FDF8EA] text-[#9E7D2B] border-[#C9A84C]/30 shadow-sm",
    danger: "bg-red-50 text-red-700 border-red-200/60"
  };

  const dotColors = {
    borrador: "bg-neutral-400",
    activo: "bg-emerald-500 animate-pulse",
    en_revision: "bg-amber-500 animate-ping",
    calificado: "bg-indigo-500",
    cerrada: "bg-purple-500",
    gold: "bg-[#C9A84C]",
    danger: "bg-red-500"
  };

  const statusKey = styles[status] ? status : 'borrador';

  return (
    <span className={"inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border " + styles[statusKey] + " " + className}>
      {dot && <span className={"w-1.5 h-1.5 rounded-full " + dotColors[statusKey]}></span>}
      {children || status.toUpperCase()}
    </span>
  );
};

export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={"bg-white rounded-2xl border border-neutral-100/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] p-5 sm:p-6 transition-all duration-300 " + 
        (hoverEffect ? 'hover:-translate-y-1 hover:shadow-[0_16px_35px_-4px_rgba(0,0,0,0.07)] hover:border-neutral-200 ' : '') + 
        (glow ? 'ring-2 ring-[#C8102E]/20 ' : '') + className}
    >
      {children}
    </div>
  );
};

export const FloatingInput = ({
  label,
  value,
  onChange,
  type = 'text',
  error,
  placeholder = ' ',
  name,
  icon: Icon,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className={"relative " + className}>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={"peer w-full px-4 pt-6 pb-2 text-sm bg-neutral-50/70 hover:bg-white focus:bg-white text-[#1A1A1A] rounded-xl border " +
            (error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 ' : 'border-neutral-200/80 focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/10 ') +
            "outline-none transition-all duration-200 placeholder-transparent " + (Icon ? 'pl-11' : '')}
          {...props}
        />
        {Icon && (
          <div className="absolute left-3.5 top-4 text-neutral-400 peer-focus:text-[#C8102E] transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <label
          className={"absolute left-4 top-2 text-xs font-medium text-neutral-500 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-neutral-400 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#C8102E] " +
            (Icon ? 'peer-placeholder-shown:left-11 peer-focus:left-11 left-11' : '')}
        >
          {label} {required && <span className="text-[#C8102E]">*</span>}
        </label>
      </div>
      {error && <p className="text-xs text-red-600 mt-1 pl-1">{error}</p>}
    </div>
  );
};