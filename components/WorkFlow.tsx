"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  IconArrowLeft,
  IconChevronDown,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  getWorkflowWithId,
  saveOrUpdateWorkflow,
  Workflow,
  WorkflowItem,
} from "@/lib/firestore";
import CustomizedTooltips from "./ToolTip";
import { CircularProgress, Modal } from "@mui/material";
import { borderRadius, Box } from "@mui/system";
import { Select } from "./Select";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { set } from "lodash";
import { toast } from "react-toastify";
import { tree } from "next/dist/build/templates/app-page";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  border: "none",
  outline: "none",
};
const iniial = {
  type: "api",
  apiData: {
    method: "GET",
    url: "",
    headers: "",
    body: "",
  },
  emailData: { emailId: "" },
  textData: { message: "" },
};
const WorkFlow = () => {
  const params = useSearchParams();
  const refId = params.get("refId");
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState<any>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [Workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [index, setIndex] = useState<number | undefined>();
  const [modal, setModal] = useState<"api" | "email" | "text" | "">("");
  const [newItem, setNewItem] = useState<WorkflowItem>(iniial);
  const [savePropmt, setSavePromt] = useState(false);
  const [editNode, setEditNode] = useState<number | undefined>();
  const user = useSelector((state: any) => state.user);
  const handleAddNode = (type: "api" | "email" | "text", index?: number) => {
    setIndex(index);
    setModal(type);

    setNewItem({ ...iniial, type: type });
  };

  const handleData = (path: string, value: any) => {
    setNewItem((item) => {
      const newItem = { ...item };
      set(newItem, path, value);
      return newItem;
    });
  };

  const pushNode = () => {
    console.log(index);
    const payload: WorkflowItem =
      newItem?.type == "api"
        ? {
            type: "api",
            apiData: newItem?.apiData,
          }
        : newItem?.type == "email"
        ? { type: "email", emailData: newItem?.emailData }
        : { type: "text", textData: newItem?.textData };
    if (editNode !== undefined) {
      setWorkflows((Workflows) =>
        Workflows?.map((w, i) => (i === editNode ? payload : w))
      );
      setEditNode(undefined);
    } else if (index === undefined) {
      setWorkflows([payload, ...Workflows]);
    } else if (index == 0) {
      setWorkflows((Workflows) => [...Workflows, payload]);
    } else {
      const updatedWorkflows = [...Workflows];
      updatedWorkflows.splice(index + 1, 0, payload);
      setWorkflows(updatedWorkflows);
    }

    setModal("");
    setIndex(undefined);
    setNewItem(iniial);
  };

  const removNode = (i: number) => {
    setWorkflows((w) => w.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    try {
      const doc: any = await saveOrUpdateWorkflow(
        {
          name,
          description,
          workflows: Workflows,
          lastEdited: {
            user: user?.name,
            timestamp: new Date(),
          },
        },
        workflow?.id
      );

      setWorkflow(doc);
      setWorkflows(doc?.workflows);
      setSavePromt(false);
    } catch (error) {
      toast.error("Failed to save workflow");
    }
  };

  useEffect(() => {
    (async () => {
      if (refId) {
        setLoading(true);
        try {
          const doc: any = await getWorkflowWithId(refId);
          if (doc) {
            setWorkflow(doc);
            setWorkflows(doc?.workflows ?? []);
            setName(doc?.name);
            setDescription(doc?.description);
          }
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [refId]);

  return (
    <>
      {loading ? (
        <div className="h-screen bg-[#F8F2E7] text-[#221F20] flex items-center justify-center">
          <CircularProgress
            sx={{ margin: "auto", display: "block", color: "#1e1e1e" }}
            size={20}
          />
        </div>
      ) : (
        <div className="h-screen bg-[#F8F2E7] text-[#221F20] ">
          <div className="h-full " style={{ background: "url(/backdrop.png)" }}>
            <div className=" py-10 px-10 h-full overflow-y-auto">
              <div className="flex gap-6 bg-white rounded-lg w-fit p-2 px-4 items-center font-bold">
                <Link href={"/"} className="underline flex items-center">
                  <IconArrowLeft size={16} />
                  Go Back
                </Link>
                <h5>{workflow ? workflow?.name : "Untitled"}</h5>

                <img
                  src="/Vector.svg"
                  alt=""
                  className="w-8 h-8 object-contain cursor-pointer"
                  onClick={() => setSavePromt(true)}
                />
              </div>

              <div className="flex justify-center mt-20 ">
                <div className="flex items-center flex-col">
                  <img src="/start.svg" />
                  <div className="flex items-center flex-col relative cursor-pointer">
                    <CustomizedTooltips handleClick={handleAddNode}>
                      <div className="rounded-full bg-white border border-[#4F4F4F] p-1 absolute top-7">
                        <IconPlus color="#4F4F4F" size={14} />
                      </div>
                    </CustomizedTooltips>
                    <div className="h-25 w-[2.5px] bg-[#4F4F4F] " />
                    <IconChevronDown
                      color="#4F4F4F"
                      className="-mt-[14.5px] "
                    />
                  </div>
                  {Workflows?.map((w, i) => (
                    <div key={i}>
                      <div
                        className="bg-white p-4 border border-slate-200 rounded-lg flex gap-10 min-w-2xs items-center justify-between cursor-pointer"
                        onClick={() => {
                          setModal(w.type as any);
                          setNewItem(w);
                          setEditNode(i);
                        }}
                      >
                        <h5 className="text-sm font-semibold">
                          {w.type === "api"
                            ? "Api Call"
                            : w.type === "email"
                            ? "Email"
                            : "Text"}
                        </h5>

                        <IconTrash
                          color="red"
                          className="cursor-pointer"
                          size={16}
                          onClick={() => removNode(i)}
                        />
                      </div>
                      <div className="flex items-center flex-col relative cursor-pointer">
                        <CustomizedTooltips
                          handleClick={handleAddNode}
                          index={i}
                        >
                          <div className="rounded-full bg-white border border-[#4F4F4F] p-1 absolute top-7">
                            <IconPlus color="#4F4F4F" size={14} />
                          </div>
                        </CustomizedTooltips>
                        <div className="h-25 w-[2.5px] bg-[#4F4F4F] " />
                        <IconChevronDown
                          color="#4F4F4F"
                          className="-mt-[14.5px] "
                        />
                      </div>
                    </div>
                  ))}
                  <img src="/end.svg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal open={Boolean(modal)} onClose={() => setModal("")}>
        <Box sx={style}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              pushNode();
            }}
          >
            <button
              type="submit"
              className="absolute -rotate-90 bg-white px-4 py-2 rounded-lg border-slate-200 text-red-600 font-semibold -left-24 top-[46px] cursor-pointer"
            >
              Configuration
            </button>

            {modal === "api" && (
              <div className="space-y-4">
                <Select
                  options={[
                    { label: "GET", value: "GET" },
                    { label: "POST", value: "POST" },
                    { label: "PUT", value: "PUT" },
                    { label: "DELETE", value: "DELETE" },
                  ]}
                  value={newItem?.apiData?.method}
                  label="Method"
                  onChange={(e) => handleData("apiData.method", e.target.value)}
                />
                <Input
                  placeholder="Type here..."
                  label="URL"
                  required
                  onChange={(e) => handleData("apiData.url", e.target.value)}
                  value={newItem?.apiData?.url}
                />

                <Textarea
                  placeholder="Type here..."
                  label="Headers"
                  onChange={(e) =>
                    handleData("apiData.headers", e.target.value)
                  }
                  value={newItem?.apiData?.headers}
                />
                <Textarea
                  placeholder="Type here..."
                  label="Body"
                  onChange={(e) => handleData("apiData.body", e.target.value)}
                  value={newItem?.apiData?.body}
                />
              </div>
            )}
            {modal === "email" && (
              <Input
                placeholder="Type here..."
                label="Email"
                onChange={(e) =>
                  handleData("emailData.emailId", e.target.value)
                }
                type="email"
                required
                value={newItem?.emailData?.emailId}
              />
            )}
            {modal === "text" && (
              <Textarea
                placeholder="Type here..."
                label="Body"
                onChange={(e) => handleData("textData.message", e.target.value)}
                required
                value={newItem?.textData?.message}
              />
            )}
          </form>
        </Box>
      </Modal>
      <Modal open={savePropmt} onClose={() => setSavePromt(false)}>
        <Box sx={[style, { p: 0 }]}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="space-y-4 p-4 shadow-lg">
              <Input
                placeholder="Type here..."
                label="Name"
                required
                onChange={(e) => setName(e.target.value)}
                value={name}
              />

              <Textarea
                placeholder="Type here..."
                label="Description"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
              />
            </div>
            <div className="p-4 flex justify-end">
              <button
                type="submit"
                className="cursor-pointer text-sm font-semibold text-white bg-red-600 px-4 rounded py-1 shadow-2xl border-slate-200"
              >
                Save
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default WorkFlow;
