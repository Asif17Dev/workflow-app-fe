import * as React from "react";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { Button, styled } from "@mui/material";
import { borderRadius, padding } from "@mui/system";

export default function CustomizedTooltips({
  children,
  handleClick,
  index,
}: {
  children: any;
  handleClick: (type: "api" | "email" | "text", index?: number) => void;
  index?: number;
}) {
  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#fff",
      color: "rgba(0, 0, 0, 0.87)",
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: "1px solid #e2e8f0",
      padding: "16px",
      borderRadius: 16,
    },
  }));
  return (
    <HtmlTooltip
      title={
        <React.Fragment>
          <div className="flex flex-wrap max-w-64 gap-4">
            <div
              className="px-4 py-2 border border-slate-200 cursor-pointer bg-white rounded-lg active:opacity-75"
              onClick={() => handleClick("api", index)}
            >
              Api Call
            </div>
            <div
              className="px-4 py-2 border border-slate-200 cursor-pointer bg-white rounded-lg active:opacity-75"
              onClick={() => handleClick("email", index)}
            >
              Email
            </div>
            <div
              className="px-4 py-2 border border-slate-200 cursor-pointer bg-white rounded-lg active:opacity-75"
              onClick={() => handleClick("text", index)}
            >
              Text
            </div>
          </div>
        </React.Fragment>
      }
      placement="right"
    >
      {children}
    </HtmlTooltip>
  );
}
