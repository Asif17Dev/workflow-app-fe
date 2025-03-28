interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && <label className="text-sm text-gray-600">{label}</label>}
      <textarea
        {...props}
        className={`mt-2 bg-white rounded-lg border border-slate-200 w-full px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
    </div>
  );
};
