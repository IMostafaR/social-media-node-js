import { formatDistanceToNow } from "date-fns";

const addDataToDocs = (documents) => {
  // Convert documents to JSON object and get number of likes for each document and add to the document object
  documents = JSON.parse(JSON.stringify(documents));

  // calculate the time elapsed since the document was created using the createdAt field and add to the document object as timeElapsed field and get number of likes for each document and add to the document object
  documents.forEach((document) => {
    const timeElapsed = new Date(document.createdAt);
    document.timeElapsed = formatDistanceToNow(timeElapsed, {
      addSuffix: true,
    });
    document.likesCount = document.likes.length;
  });

  return documents;
};

export { addDataToDocs };
