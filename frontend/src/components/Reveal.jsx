import { useInView } from "../hooks/useInView.js";

// Fades and lifts its children in the first time they scroll into view.
// `delay` (ms) staggers siblings.
export default function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const [ref, seen] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${seen ? "reveal--in" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
