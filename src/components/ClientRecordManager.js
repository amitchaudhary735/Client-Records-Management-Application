import React, { useState } from "react";
import FileUpload from "./FileUpload";
import "./ClientRecordManager.css";

const ClientRecordManager = () => {
  const [baseData, setBaseData] = useState([]); 
  const [originalData, setOriginalData] = useState([]); 
  const [selectedFileName, setSelectedFileName] = useState(null); 
  const [error, setError] = useState(null); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [editingId, setEditingId] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1); 
  const recordsPerPage = 5; 

  
  const mergeData = (base, newData) => {
    const uniqueEmails = new Set(base.map((item) => item.email));
    const filteredNewData = newData.filter((item) => {
      if (!item.email || uniqueEmails.has(item.email)) {
        return false; 
      }
      uniqueEmails.add(item.email);
      return true; 
    });
    return [...base, ...filteredNewData];
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target.result);
          if (Array.isArray(parsedData)) {
            setOriginalData(parsedData); 
            if (!selectedFileName) {
              setSelectedFileName(file.name);
              setBaseData(parsedData); 
            } else {
              const updatedData = mergeData(baseData, parsedData);
              setBaseData(updatedData);
            }
            setError(null);
          } else {
            setError("The JSON file must contain an array of objects.");
          }
        } catch (err) {
          setError("Invalid JSON file. Please upload a valid JSON.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Please upload a valid JSON file.");
    }
  };

  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1); 
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = (id, name, email) => {
    const uniqueEmails = new Set(originalData.map((item) => item.email));

    if (uniqueEmails.has(email)) {
      setError("This email is already in use. Please enter a unique email.");
    } else {
      setError(null);
      const updatedData = baseData.map((item) =>
        item.id === id ? { ...item, name, email } : item
      );
      setBaseData(updatedData); 
      setEditingId(null);
    }
  };

  
  const handleDelete = (id) => {
    setBaseData((prev) => {
      const updatedData = prev.filter((item) => item.id !== id);
  
      const totalPages = Math.ceil(updatedData.length / recordsPerPage);
  
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
  
      return updatedData;
    });
  };
  

  const filteredData = baseData.filter(
    (item) =>
      item.id?.toString().includes(searchQuery) ||
      item.name?.toLowerCase().includes(searchQuery) ||
      item.email?.toLowerCase().includes(searchQuery)
  );
  return (
    <div className="container">
      <h1>Client Records Management Application</h1>
      <div className="input-cont">
        <FileUpload handleFileUpload={handleFileUpload} />
      </div>
      {error && <p>{error}</p>}

      <input
        type="text"
        placeholder="Search by ID, Name, or Email"
        value={searchQuery}
        onChange={handleSearch}
      />

      <div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData
              .slice(
                (currentPage - 1) * recordsPerPage,
                currentPage * recordsPerPage
              )
              .map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>
                    {editingId === record.id ? (
                      <input
                        type="text"
                        value={record.name}
                        onChange={(e) =>
                          setBaseData((prev) =>
                            prev.map((item) =>
                              item.id === record.id
                                ? { ...item, name: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    ) : (
                      record.name
                    )}
                  </td>
                  <td>
                    {editingId === record.id ? (
                      <input
                        type="email"
                        value={record.email}
                        onChange={(e) =>
                          setBaseData((prev) =>
                            prev.map((item) =>
                              item.id === record.id
                                ? { ...item, email: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    ) : (
                      record.email
                    )}
                  </td>
                  <td>
                    {editingId === record.id ? (
                      <button
                        onClick={() =>
                          handleSave(record.id, record.name, record.email)
                        }
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(record.id)}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(record.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        {Array.from(
          { length: Math.ceil(filteredData.length / recordsPerPage) },
          (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ClientRecordManager;
