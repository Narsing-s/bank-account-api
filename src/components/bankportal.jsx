import React, { useState } from "react";
 
export default function BankPortal({ baseUrl = "http://localhost:8051/api" }) {
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
 
  const [create, setCreate] = useState({ FullName: "", dateOfBirth: "", mobileNumber: "", bankName: "", email: "", address: "", adharNumber: "" });
  const [searchAccount, setSearchAccount] = useState("");
  const [fetched, setFetched] = useState(null);
  const [update, setUpdate] = useState({ accountNumber: "", FULLNAME: "", ADDRESS: "", MOBILENUMBER: "" });
  const [deleteAccountId, setDeleteAccountId] = useState("");
 
  const resetMessages = () => { setMessage(null); setError(null); };
 
  async function safeFetch(url, opts = {}){
    setLoading(true); resetMessages();
    try{
      const res = await fetch(url, opts);
      const text = await res.text();
      let json;
      try { json = text ? JSON.parse(text) : null; } catch(e){ json = { raw: text }; }
      if(!res.ok) throw { status: res.status, body: json };
      return json;
    } finally { setLoading(false); }
  }
 
  // Your handleCreate, handleGet, handleUpdate, handleDelete functions here
  // (Paste them exactly as in your last code snippet)
 
  const tabs = [
    { id: "create", label: "Create Account" },
    { id: "fetch", label: "Fetch Account" },
    { id: "update", label: "Update Account" },
    { id: "delete", label: "Deactivate Account" },
  ];
 
  return (
    <div className="container">
      <header>
        <h1>Bank Account — Admin Portal</h1>
        <p>Create, fetch, update or deactivate customer accounts</p>
      </header>
 
      {(message || error) && (
        <div className={`notification ${error ? 'error' : 'success'}`}>
          <strong>{error ? 'Error: ' : 'Success: '}</strong>
          <span>{error || message}</span>
        </div>
      )}
 
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => { setActiveTab(tab.id); resetMessages(); }}
          >
            {tab.label}
          </button>
        ))}
      </div>
 
      <div className="tab-content">
        {activeTab === "create" && (
          <form className="box" onSubmit={handleCreate}>
            {/* create form inputs */}
          </form>
        )}
 
        {activeTab === "fetch" && (
          <div className="box">
            {/* fetch form inputs */}
          </div>
        )}
 
        {activeTab === "update" && (
          <form className="box" onSubmit={handleUpdate}>
            {/* update form inputs */}
          </form>
        )}
 
        {activeTab === "delete" && (
          <div className="box">
            {/* delete form inputs */}
          </div>
        )}
      </div>
 
      <footer>Tip: ensure your Mule API is running and CORS is enabled for this UI to call it from browser.</footer>
    </div>
  );
}
 
