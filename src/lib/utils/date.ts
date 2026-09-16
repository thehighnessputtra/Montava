import { Timestamp } from "firebase/firestore";

export function formatDate(
  date:
    | Timestamp
    | Date
    | {
        seconds: number;
        nanoseconds?: number;
      }
    | string
    | null
    | undefined,
): string {
  if (!date) {
    return "-";
  }

  let jsDate: Date;

  // Firestore Timestamp
  if (date instanceof Timestamp) {
    jsDate = date.toDate();
  }
  // JavaScript Date
  else if (date instanceof Date) {
    jsDate = date;
  }
  // Firestore Timestamp hasil serialisasi
  else if (
    typeof date === "object" &&
    "seconds" in date &&
    typeof date.seconds === "number"
  ) {
    jsDate = new Date(date.seconds * 1000);
  }
  // String tanggal
  else if (typeof date === "string") {
    jsDate = new Date(date);
  }
  else {
    return "-";
  }

  // Pastikan tanggal valid
  if (Number.isNaN(jsDate.getTime())) {
    return "-";
  }

  return jsDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}