import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sales")({
  component: AdminSalesPanel,
});

function AdminSalesPanel() {
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  // Load sales users (profiles with role "sales")
  useEffect(() => {
    supabase
      .from("profiles")
      .select("*, user:auth_user_id!inner(user_metadata)")
      .eq("user:user_metadata.role", "sales")
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
        } else {
          setSalesUsers(data || []);
        }
      });
  }, []);

  // Load all students (profiles without sales assignment)
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name")
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
        } else {
          setStudents(data || []);
        }
      });
  }, []);

  // Load transactions for selected user with optional date filter
  const fetchTransactions = async () => {
    if (!selectedUser) return;
    const query = supabase
      .from("training_transactions")
      .select("id, date, amount, course_name")
      .eq("sales_rep_id", selectedUser);
    if (startDate) query.gte("date", startDate);
    if (endDate) query.lte("date", endDate);
    const { data, error } = await query;
    if (error) {
      console.error(error);
    } else {
      setTransactions(data || []);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, startDate, endDate]);

  const assignStudent = async () => {
    if (!selectedStudent || !selectedUser) {
      toast.error("Select both a student and a sales rep.");
      return;
    }
    const { error } = await supabase.from("sales_notes").insert({
      profile_id: selectedStudent,
      sales_rep_id: selectedUser,
      status: "assigned",
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Student assigned to sales rep.");
      // Refresh student list
      setStudents((prev) => prev.filter((s) => s.id !== selectedStudent));
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold">Sales Team Management (Admin)</h1>

      {/* Sales Users Section */}
      <section>
        <h2 className="text-2xl mb-4">Sales Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {salesUsers.map((user) => (
            <Card
              key={user.id}
              className={`cursor-pointer hover:scale-105 transition-transform ${
                selectedUser === user.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedUser(user.id)}
            >
              <CardHeader>
                <CardTitle>{user.full_name || "Unnamed"}</CardTitle>
              </CardHeader>
              <CardContent>{user.email || "No email"}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Transaction History Section */}
      {selectedUser && (
        <section>
          <h2 className="text-2xl mb-4">Sales History</h2>
          <div className="flex gap-4 mb-4">
            <Input
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              placeholder="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                  <TableCell>{tx.course_name ?? "-"}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      {/* Assign Student Section */}
      <section>
        <h2 className="text-2xl mb-4">Assign Student to Sales Rep</h2>
        <div className="flex gap-4 items-center">
          <select
            className="p-2 rounded bg-gray-800 text-white"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
          <select
            className="p-2 rounded bg-gray-800 text-white"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select Sales Rep</option>
            {salesUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>
          <Button onClick={assignStudent}>Assign</Button>
        </div>
      </section>
    </div>
  );
}
