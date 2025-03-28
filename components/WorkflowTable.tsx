"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Pagination,
  CircularProgress,
  Button,
  IconButton,
} from "@mui/material";
import {
  fetchWorkflowExecutions,
  fetchWorkflows,
  getTotalWorkflowsCount,
  WorkflowItem,
} from "@/lib/firestore";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendEmail } from "@/lib/sendEmail";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import {
  IconArrowDown,
  IconArrowUp,
  IconExternalLink,
} from "@tabler/icons-react";

const formatTimestamp2 = (timestamp: number) => {
  const date = new Date(timestamp); // Convert milliseconds to Date object

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);

  const formattedTime = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${formattedDate.replace("/", "/")} - ${formattedTime} IST`;
};

const formatTimestamp = (
  timestamp: { seconds: number; nanoseconds: number } | null,
  user: string
) => {
  if (!timestamp) return "N/A";

  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);

  if (isNaN(date.getTime())) return "Invalid Date";

  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Kolkata",
  };

  const formattedTime = new Intl.DateTimeFormat("en-IN", options).format(date);
  return `${user} | ${formattedTime.replace(",", " IST -")}`;
};

const WorkflowsTable = ({
  workflows = [],
  loading,
  totalPages,
  page,
  handlePageChange,
}: {
  workflows: any[];
  loading: boolean;
  totalPages: number;
  page: number;
  handlePageChange: (_: any, newPage: number) => void;
}) => {
  const router = useRouter();
  const [eid, setEid] = useState<string | undefined>();
  const user = useSelector((state: any) => state.user);
  const [opId, setOpId] = useState<string | undefined>();
  const [opLoading, setLoading] = useState(false);
  const [operations, setOperations] = useState<any[]>([]);

  const handleExecute = async (id: string, workflows: WorkflowItem[]) => {
    let combinedMessage = "";
    let isWorkflowFailed = false;
    let operationsLog: any[] = [];

    setEid(id);

    for (const workflow of workflows) {
      if (isWorkflowFailed) break;

      try {
        if (workflow.type === "api" && workflow.apiData) {
          try {
            const headers = workflow.apiData.headers
              ? JSON.parse(workflow.apiData.headers)
              : {};

            const body = workflow.apiData.body
              ? JSON.parse(workflow.apiData.body)
              : undefined;
            const response = await axios({
              method: workflow.apiData.method as any,
              url: workflow.apiData.url,
              headers: headers,
              data: body,
            });

            combinedMessage += `✅ API Success: ${
              workflow.apiData.url
            }\nResponse: ${JSON.stringify(response.data, null, 2)}\n\n`;

            operationsLog.push({
              type: "api",
              status: true,
              timestamp: Date.now(),
            });
          } catch (error: any) {
            combinedMessage += `❌ API Failed: ${
              workflow.apiData.url
            }\nError: ${error.message || "Unknown error"}\n\n`;
            isWorkflowFailed = true;

            operationsLog.push({
              type: "api",
              status: false,
              timestamp: Date.now(),
            });

            break;
          }
        }

        if (workflow.type === "text" && workflow.textData) {
          combinedMessage += `📩 Text Message: ${workflow.textData.message}\n\n`;
        }

        if (workflow.type === "email" && workflow.emailData) {
          try {
            const emailParams = {
              to_email: workflow.emailData.emailId,
              message: combinedMessage || "No API responses or text messages.",
              title: "# " + id,
              name: user?.name,
            };

            await sendEmail(emailParams);

            console.log(`✅ Email sent to: ${workflow.emailData.emailId}`);

            // 🔹 Log Email success
            operationsLog.push({
              type: "email",
              status: true,
              timestamp: Date.now(),
            });

            combinedMessage = "";
          } catch (error) {
            console.error("❌ Email failed:", error);
            isWorkflowFailed = true;

            operationsLog.push({
              type: "email",
              status: false,
              timestamp: Date.now(),
            });

            break;
          }
        }
      } catch (error) {
        console.error("❌ Error processing workflow:", error);
        toast.error("Workflow operations faild");
      }
    }

    await addDoc(collection(db, "workflow_executions"), {
      workflowId: id,
      status: !isWorkflowFailed,
      operations: operationsLog,
      timestamp: Date.now(),
    });

    if (opId && id === opId) {
      handleOperations(opId, true);
    }

    setEid(undefined);

    toast.success("Workflow operations runned successfully");

    console.log("✅ Workflow execution completed.");
  };

  const handleOperations = async (id: string, reload?: boolean) => {
    if (id == opId && !reload) return setOpId(undefined);
    try {
      if (!reload) {
        setOpId(id);
        setOperations([]);
      }

      setLoading(true);
      const logs = await fetchWorkflowExecutions(id);
      setOperations(logs);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
      {loading ? (
        <CircularProgress
          sx={{ margin: "auto", display: "block", color: "#1e1e1e" }}
          size={20}
        />
      ) : (
        <TableContainer>
          <Table sx={{ borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow className="!border-b-amber-600 !border-b">
                <TableCell sx={{ borderBottom: "1px solid #FAD2BE" }}>
                  <strong>Workflow Name</strong>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #FAD2BE" }}>
                  <strong>Id</strong>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #FAD2BE" }}>
                  <strong>Last Edited On</strong>
                </TableCell>
                <TableCell sx={{ borderBottom: "1px solid #FAD2BE" }}>
                  <strong>Description</strong>
                </TableCell>
                <TableCell
                  sx={{ borderBottom: "1px solid #FAD2BE" }}
                ></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workflows.length > 0 ? (
                workflows.map((workflow) => (
                  <React.Fragment key={workflow.id}>
                    <TableRow>
                      <TableCell sx={{ borderBottom: "1px solid #F8F2E7" }}>
                        {workflow.name}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #F8F2E7" }}>
                        # {workflow.id}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #F8F2E7" }}>
                        {workflow.lastEdited && workflow.lastEdited.timestamp
                          ? formatTimestamp(
                              workflow.lastEdited.timestamp,
                              workflow.lastEdited.user
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #F8F2E7" }}>
                        {workflow.description}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #F8F2E7" }}>
                        <div className="flex gap-2">
                          <Button
                            className="!capitalize font-semibold !text-xs !bg-white !border-slate-200"
                            variant="outlined"
                            color="inherit"
                            size="small"
                            onClick={() =>
                              handleExecute(workflow?.id, workflow?.workflows)
                            }
                            disabled={eid === workflow?.id}
                          >
                            {eid === workflow?.id ? (
                              <CircularProgress
                                sx={{
                                  margin: "auto",
                                  display: "block",
                                  color: "#1e1e1e",
                                }}
                                size={12}
                              />
                            ) : (
                              "Execute"
                            )}
                          </Button>
                          <Button
                            className="!capitalize font-semibold !text-xs !bg-white !border-slate-200"
                            variant="outlined"
                            color="inherit"
                            size="small"
                            onClick={() =>
                              router.push("/new-workflow?refId=" + workflow.id)
                            }
                          >
                            Edit
                          </Button>

                          <IconButton
                            size="small"
                            onClick={() => handleOperations(workflow?.id)}
                          >
                            {opId === workflow?.id ? (
                              <IconArrowUp size={16} />
                            ) : (
                              <IconArrowDown size={16} />
                            )}
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                    {opId === workflow?.id && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{
                            borderBottom: "1px solid #F8F2E7",
                            background: "#FFFAF2",
                          }}
                        >
                          {opLoading ? (
                            <CircularProgress
                              sx={{
                                margin: "auto",
                                display: "block",
                                color: "#1e1e1e",
                              }}
                              size={20}
                            />
                          ) : (
                            <div className="relative space-y-8">
                              {operations?.map((op, i) => (
                                <div
                                  className="relative flex gap-4 items-center"
                                  key={i}
                                >
                                  {i + 1 < operations?.length && (
                                    <div className="h-16 w-[2px] bg-[#FFE1D2] absolute top-6 left-[7px]" />
                                  )}
                                  <div className="bg-[#FFE1D2] w-4 h-4 flex items-center justify-center rounded-full">
                                    <div className="bg-[#FF5200] w-2 h-2 rounded-full" />
                                  </div>
                                  <p className="text-sm mb0">
                                    {formatTimestamp2(op?.timestamp)}
                                  </p>
                                  <div
                                    className={`w-16 text-xs h-7 flex items-center justify-center rounded-lg ${
                                      op?.status
                                        ? "bg-[#DDEBC0]"
                                        : "bg-[#F8AEA8]"
                                    }`}
                                  >
                                    {op?.status ? "Passed" : "Failed"}
                                  </div>

                                  <IconButton
                                    onClick={() =>
                                      router.push(
                                        "/workflow-status?workflowId=" +
                                          workflow?.id +
                                          "&operationId=" +
                                          op?.id
                                      )
                                    }
                                  >
                                    <IconExternalLink color="black" />
                                  </IconButton>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No workflows found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        size="small"
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "flex-end",
          "& .MuiPaginationItem-root": {
            backgroundColor: "#FEF3E9",
            borderRadius: "4px",
            color: "#000",
            "&:hover": {
              backgroundColor: "#FAD2BE",
            },
            "&.Mui-selected": {
              backgroundColor: "#FEF3E9",
              fontWeight: "semibold",
            },
          },
        }}
      />
    </Paper>
  );
};

export default WorkflowsTable;
