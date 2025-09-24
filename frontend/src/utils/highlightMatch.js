export const highlightMatch = (text, match) => {
  if (!match || typeof text !== "string") return text;

  try {
    const regex = new RegExp(`(${match})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, idx) =>
      regex.test(part) ? (
        <span key={idx} className="bg-yellow-200 rounded px-1">
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  } catch (err) {
    console.error("Regex error in highlightMatch:", err);
    return text;
  }
};
