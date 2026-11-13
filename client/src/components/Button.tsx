interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "light";
}

export default function Button({
  loading = false,
  loadingText,
  variant = "primary",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const base =
    "w-full font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
    light:
      "text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]}`}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      )}
      {loading ? loadingText || "Loading..." : children}
    </button>
  );
}