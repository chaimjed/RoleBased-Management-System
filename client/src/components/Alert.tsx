interface AlertProps {
  color: "success" | "failure";
  children: React.ReactNode;
}

export default function Alert({ color, children }: AlertProps) {
  const styles = {
    success:
      "text-green-800 bg-green-50 border border-green-300 dark:bg-gray-800 dark:text-green-400 dark:border-green-800",
    failure:
      "text-red-800 bg-red-50 border border-red-300 dark:bg-gray-800 dark:text-red-400 dark:border-red-800",
  };

  return (
    <div className={`p-4 text-sm rounded-lg ${styles[color]}`} role="alert">
      {children}
    </div>
  );
}