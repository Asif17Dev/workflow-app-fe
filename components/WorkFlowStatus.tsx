"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconChevronDown,
  IconRosetteDiscountCheck,
  IconTrash,
} from "@tabler/icons-react";
import { fetchWorkflowWithExecutions } from "@/lib/firestore";

import { CircularProgress } from "@mui/material";

import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

const WorkFlowStatus = () => {
  const params = useSearchParams();
  const workflowId = params.get("workflowId");
  const operationId = params.get("operationId");
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState<any>();
  const user = useSelector((state: any) => state.user);

  useEffect(() => {
    (async () => {
      if (workflowId && operationId) {
        setLoading(true);
        try {
          const doc: any = await fetchWorkflowWithExecutions(
            workflowId,
            operationId
          );
          setWorkflow(doc);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [workflowId]);

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
                <h5>{workflow ? workflow?.workflow?.name : "Untitled"}</h5>

                <div
                  className={`w-16 text-xs h-7 flex items-center justify-center rounded-lg ${
                    workflow?.execution?.status
                      ? "bg-[#DDEBC0]"
                      : "bg-[#F8AEA8]"
                  }`}
                >
                  {workflow?.execution?.status ? "Passed" : "Failed"}
                </div>
              </div>

              <div className="flex justify-center mt-20 ">
                <div className="flex items-center flex-col">
                  <img src="/start.svg" />
                  <div className="flex items-center flex-col relative cursor-pointer">
                    <div className="h-25 w-[2.5px] bg-[#4F4F4F] " />
                    <IconChevronDown
                      color="#4F4F4F"
                      className="-mt-[14.5px] "
                    />
                  </div>
                  {(workflow?.execution?.operations as any[])?.map((w, i) => (
                    <div key={i}>
                      <div
                        className={`bg-white p-4 border rounded-lg flex gap-10 min-w-2xs items-center justify-between ${
                          workflow?.execution?.status
                            ? "border-[#849E4C]"
                            : "border-[#FF0000]"
                        }`}
                      >
                        <h5 className="text-sm font-semibold">
                          {w.type === "api"
                            ? "Api Call"
                            : w.type === "email"
                            ? "Email"
                            : "Text"}
                        </h5>

                        {w?.status ? (
                          <IconRosetteDiscountCheck
                            color="#849E4C"
                            className="cursor-pointer"
                            size={16}
                          />
                        ) : (
                          <IconAlertCircle
                            color="#FF0000"
                            className="cursor-pointer"
                            size={16}
                          />
                        )}
                      </div>
                      <div className="flex items-center flex-col relative cursor-pointer">
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
    </>
  );
};

export default WorkFlowStatus;
