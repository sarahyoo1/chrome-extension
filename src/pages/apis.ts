import { addDoc, collection, doc, DocumentData, FirestoreDataConverter, getDoc, QueryDocumentSnapshot, Timestamp, updateDoc} from "firebase/firestore";
import { Problem, Topic } from "./types";
import { auth, db } from "@src/libs/firebase";
import { get_blob_uri, prompts, url_to_file } from "./utils";
import { json_model } from "@src/libs/gemini_ai";

export const analyze_code = async (image_url:string) => {
    const file = await url_to_file(image_url);
    const uri = await get_blob_uri(file);
    const result = await json_model.generateContent([
      prompts.code_analysis,
      {
        inlineData: {
          data: uri,
          mimeType: file.type
        }
      }
    ]);

    const data = JSON.parse(result.response.text()) as Problem;
    data.topics = data.topics.map((topic) => topic.toLowerCase());
    return data;
}

const converter = <T>() : FirestoreDataConverter<T> => ({
  toFirestore: (data: T) => data as DocumentData,  
  fromFirestore: (snap: QueryDocumentSnapshot): T => snap.data() as T  
});

export async function add_problem (problem : Problem) {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    try {
        const new_problem = {
            ...problem,
            status: "Just solved",
            date_solved: Timestamp.now()
        }
        const colRef = collection(db, `users/${uid}/problems`);
        await addDoc(colRef.withConverter(converter<Problem>()), new_problem);
        await update_topics(uid, problem.topics);
    } catch (e) {
        console.error(e);
    }
}

export async function update_topics(uid: string, topicNames: string[]) {
  const topics = await get_topics(uid);

  if (!topics) {
    const new_topics = Array.from(topicNames, (name) => ({name: name, count: 1}));
    await update_doc_topics(uid, new_topics);
    return;
  }

  const topicsMap = new Map(topics.map(topic => [topic.name, topic]));

  topicNames.forEach((topicName) => {
      const topic = topicsMap.get(topicName);
      if (topic) {
          topic.count ++;
      } else {
        topicsMap.set(topicName, {name: topicName, count: 1});
      }
  });

  const updated = [...topicsMap.values()];
  await update_doc_topics(uid, updated);
}

async function get_topics(uid: string) {
  const docSnapshot = await getDoc(doc(db, `users/${uid}`));
  if (docSnapshot.exists()) {
    const topics = docSnapshot.data().topics;
    return topics as Topic[];
  } else {
    throw new Error('This user does not exist. Sign In to create an accout.');
  }
}

async function update_doc_topics(uid: string, updated_topics: Topic[]) {
  try {
      await updateDoc(doc(db, `users/${uid}`), {topics: updated_topics});
  } catch(e) {
      console.error(e);
  }
}