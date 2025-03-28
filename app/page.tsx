"use client";
import WorkflowsTable from "@/components/WorkflowTable";
import { auth } from "@/lib/firebase";
import { fetchWorkflows, getTotalWorkflowsCount } from "@/lib/firestore";
import { removeUser } from "@/redux/reducer/userReducer";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { IconLogout, IconPlus, IconSearch } from "@tabler/icons-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function Home() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [lastDocs, setLastDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const dispatch = useDispatch();

  useEffect(() => {
    loadWorkflows(1, true);
    fetchTotalCount();
  }, [searchTerm]);

  const fetchTotalCount = async () => {
    const count = await getTotalWorkflowsCount(searchTerm);
    setTotalPages(Math.ceil(count / 10));
  };

  const loadWorkflows = async (newPage: number, reset = false) => {
    setLoading(true);

    try {
      const lastDoc = newPage > 1 ? lastDocs[newPage - 2] : null;
      const { workflows: newWorkflows, lastVisible } = await fetchWorkflows(
        searchTerm,
        lastDoc
      );

      setWorkflows(reset ? newWorkflows : [...workflows, ...newWorkflows]);

      if (lastVisible && newPage > lastDocs.length) {
        setLastDocs((prev) => [...prev, lastVisible]);
      }
    } catch (error) {
      console.error("Failed to load workflows:", error);
    }

    setLoading(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
    setLastDocs([]);
  };

  const handlePageChange = (_: any, newPage: number) => {
    if (newPage !== page) {
      setPage(newPage);
      loadWorkflows(newPage);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(removeUser());
      router.push("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  return (
    <div className="p-8 bg-[#FDFBF6] h-screen overflow-y-auto ">
      <div className="flex items-center mb-6 gap-2">
        <h5 className="font-bold text-xl">Workflow Builder</h5>

        <IconButton size="small" onClick={handleLogout}>
          <IconLogout size={16} />
        </IconButton>
      </div>
      <div className="flex justify-between items-center mb-4 gap-4">
        <TextField
          placeholder="Search By Workflow Name/ID"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          className="bg-white !h-8 max-w-2xs outline-amber-600"
          style={{ height: "32px !important" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconSearch size={16} color="gray" />
              </InputAdornment>
            ),
            className: "h-8 !text-sm",
          }}
        />
        <Button
          className="!h-8 !bg-[#221F20] !text-sm !capitalize"
          variant="contained"
          startIcon={<IconPlus size={16} />}
          onClick={() => router.push("/new-workflow")}
        >
          Add new workflow
        </Button>
      </div>
      <WorkflowsTable
        handlePageChange={handlePageChange}
        loading={loading}
        page={page}
        totalPages={totalPages}
        workflows={workflows}
      />
    </div>
  );
}
