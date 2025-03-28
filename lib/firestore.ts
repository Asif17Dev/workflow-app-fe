import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  getDoc,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getFirestore,
  getCountFromServer,
  DocumentSnapshot,
} from "firebase/firestore";

export interface WorkflowItem {
  type: "api" | "email" | "text" | string;
  apiData?: {
    method: "GET" | "POST" | "PUT" | "DELETE" | string;
    url: string;
    headers: string;
    body: string;
  };
  emailData?: { emailId: string };
  textData?: { message: string };
}

export interface Workflow {
  name: string;
  description: string;
  workflows: WorkflowItem[];
}

export const saveOrUpdateWorkflow = async (workflow: any, docId?: string) => {
  try {
    if (docId) {
      const docRef = doc(db, "workflows", docId);
      await setDoc(docRef, workflow, { merge: true });

      const updatedDoc = await getDoc(docRef);
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } else {
      const docRef = await addDoc(collection(db, "workflows"), workflow);

      const savedDoc = await getDoc(doc(db, "workflows", docRef.id));

      return { id: savedDoc.id, ...savedDoc.data() };
    }
  } catch (error) {
    console.error("Error saving/updating workflow:", error);
    throw error;
  }
};

export async function getWorkflows() {
  const querySnapshot = await getDocs(collection(db, "workflows"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

const PAGE_SIZE = 10; // Change this as needed
export const fetchWorkflows = async (
  searchTerm = "",
  lastDocRef: DocumentSnapshot | null = null
) => {
  try {
    let workflows: any[] = [];
    let lastVisible: DocumentSnapshot | null = null;

    if (searchTerm) {
      // 🔹 Query by ID (Exact Match)
      const idQuerySnapshot = await getDocs(
        query(collection(db, "workflows"), where("__name__", "==", searchTerm))
      );

      if (!idQuerySnapshot.empty) {
        workflows = idQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // If found by ID, return immediately
        return { workflows, lastVisible: null };
      }

      // 🔹 Query by Name (Partial Match)
      const nameQuery = query(
        collection(db, "workflows"),
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff"),
        orderBy("name"),
        limit(PAGE_SIZE)
      );

      const nameQuerySnapshot = await getDocs(nameQuery);
      lastVisible = nameQuerySnapshot.docs.length
        ? nameQuerySnapshot.docs[nameQuerySnapshot.docs.length - 1]
        : null;

      const nameWorkflows = nameQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      workflows = [...nameWorkflows];

      // 🔹 Query all and filter by ID containing searchTerm
      const allQuerySnapshot = await getDocs(collection(db, "workflows"));
      const idFilteredWorkflows = allQuerySnapshot.docs
        .filter((doc) => doc.id.includes(searchTerm)) // 🔥 Filter by ID containing searchTerm
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      // 🔹 Merge results while avoiding duplicates
      const allResults = [
        ...workflows,
        ...idFilteredWorkflows.filter(
          (wf) => !workflows.some((existing) => existing.id === wf.id)
        ),
      ].slice(0, PAGE_SIZE); // Ensure we limit results

      return { workflows: allResults, lastVisible };
    } else {
      // Default fetch
      let workflowsQuery = query(
        collection(db, "workflows"),
        orderBy("name"),
        limit(PAGE_SIZE)
      );

      if (lastDocRef) {
        workflowsQuery = query(workflowsQuery, startAfter(lastDocRef));
      }

      const querySnapshot = await getDocs(workflowsQuery);
      lastVisible = querySnapshot.docs.length
        ? querySnapshot.docs[querySnapshot.docs.length - 1]
        : null;

      workflows = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    return { workflows, lastVisible };
  } catch (error) {
    console.error("Error fetching workflows:", error);
    throw error;
  }
};
export const getTotalWorkflowsCount = async (searchTerm = "") => {
  try {
    let workflowsQuery: any = collection(db, "workflows");

    if (searchTerm) {
      // 🔹 Query by ID (Exact Match)
      const idQuerySnapshot = await getDocs(
        query(collection(db, "workflows"), where("__name__", "==", searchTerm))
      );

      if (!idQuerySnapshot.empty) return 1;

      // 🔹 Query by Name
      workflowsQuery = query(
        collection(db, "workflows"),
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff")
      );

      const nameSnapshot = await getDocs(workflowsQuery);
      const nameCount = nameSnapshot.size;

      // 🔹 Query all and filter by ID containing searchTerm
      const allQuerySnapshot = await getDocs(collection(db, "workflows"));
      const idFilteredCount = allQuerySnapshot.docs.filter((doc) =>
        doc.id.includes(searchTerm)
      ).length;

      return nameCount + idFilteredCount;
    }

    // Default count
    const snapshot = await getDocs(workflowsQuery);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting total count:", error);
    return 0;
  }
};

export const getWorkflowWithId = async (docId: string) => {
  try {
    const docRef = doc(db, "workflows", docId);
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...updatedDoc.data() };
  } catch (error) {
    console.error("Error getting workflow:", error);
    throw error;
  }
};

export const fetchWorkflowExecutions = async (workflowId: string) => {
  try {
    const executionsQuery = query(
      collection(db, "workflow_executions"),
      where("workflowId", "==", workflowId)
    );

    const querySnapshot = await getDocs(executionsQuery);

    const executions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return executions;
  } catch (error) {
    console.error("❌ Error fetching workflow executions:", error);
    return [];
  }
};

export const fetchWorkflowWithExecutions = async (
  workflowId: string,
  executionId: string
) => {
  try {
    const workflowRef = doc(db, "workflows", workflowId);
    const workflowSnap = await getDoc(workflowRef);

    if (!workflowSnap.exists()) {
      console.error("❌ Workflow not found!");
      return null;
    }

    const executionsQuery = query(
      collection(db, "workflow_executions"),
      where("workflowId", "==", workflowId),
      where("__name__", "==", executionId)
    );

    const executionSnapshot = await getDocs(executionsQuery);

    if (executionSnapshot.empty) {
      console.error("❌ Workflow Execution not found!");
      return null;
    }

    const executionData = executionSnapshot.docs[0].data();

    return {
      workflow: { id: workflowId, ...workflowSnap.data() },
      execution: { id: executionId, ...executionData },
    };
  } catch (error) {
    console.error(
      "❌ Error fetching combined workflow & execution data:",
      error
    );
    return null;
  }
};
