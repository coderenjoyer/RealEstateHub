"use client"

import { useState } from "react"
import { Sidebar } from "../../ui/adminsidebar"
import { Plus } from "lucide-react"
import { AccountCard } from "./user-card"

type AccountType = "agent" | "user"

interface Account {
  id: string
  name: string
  email: string
  phone: string
  properties: number
  status?: "Pending" | "Closing"
}

const agentAccounts: Account[] = [
  {
    id: "1",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
    status: "Pending",
  },
  {
    id: "2",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
    status: "Closing",
  },
  {
    id: "3",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
    status: "Pending",
  },
  {
    id: "4",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
    status: "Closing",
  },
  {
    id: "5",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
    status: "Pending",
  },
  {
    id: "6",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
    status: "Pending",
  },
]

const userAccounts: Account[] = [
  {
    id: "1",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
  },
  {
    id: "2",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
  },
  {
    id: "3",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
  },
  {
    id: "4",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
  },
  {
    id: "5",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
  },
  {
    id: "6",
    name: "Jandene Fernandez",
    email: "fernandez.jandene@agent.com",
    phone: "+6499646403252",
    properties: 100,
  },
]

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<AccountType>("agent")
  const [searchQuery, setSearchQuery] = useState("")

  const currentAccounts = activeTab === "agent" ? agentAccounts : userAccounts

  return (
    <div className="flex h-screen bg-[#B8C9D9]">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("agent")}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "agent" ? "bg-[#4A90E2] text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Agent Account
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "user" ? "bg-[#4A90E2] text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                User Account
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium">
              <Plus className="w-4 h-4" />
              Add {activeTab === "agent" ? "Agent" : "User"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentAccounts.map((account) => (
              <AccountCard key={account.id} account={account} showStatus={activeTab === "agent"} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
