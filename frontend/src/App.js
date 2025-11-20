import './App.css';
import { useEffect, useState } from 'react';
import axios from "axios";

function App() {

  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const result = await axios.get("http://127.0.0.1:8000/products")
    setItems(result.data);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ADD ITEM
  const handleitem = async (e) => {
    e.preventDefault();

    if (editingId == null) {
      await axios.post("http://127.0.0.1:8000/product", form);
    }
    else {
      await axios.put(`http://127.0.0.1:8000/product/${editingId}`, form)
      setEditingId(null);
    }

    setForm({
      name: "",
      description: ""
    });
    loadProducts();
  };

  // EDIT FORM FILLER (ONLY fills form)
  const handleEditForm = (item) => {
    setEditingId(item.id);
    // console.log("Editing ID:", item.id);

    setForm({
      name: item.name,
      description: item.description
    });
  };

  const handleDeleteForm = async (id) => {
    await axios.delete(`http://127.0.0.1:8000/product/${id}`)

    // Remove from UI
    const Updated = items.filter((item) => item.id !== id)//Keep only those items where item.id is NOT equal to the deleted ID.
    setItems(Updated)
  }
  return (
    <>
      <form onSubmit={handleitem}>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter Name"
        />

        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter Description"
        />

        <button type="submit">{editingId ? "Update" : "Add"}</button>
      </form>

      <h3>Array Output:</h3>

      {items.map((item, index) => (
        <div key={index}>
          <p>Id: {index + 1}</p>
          <p>Name: {item.name}</p>
          <p>Description: {item.description}</p>

          <button onClick={() => handleEditForm(item)}>Edit</button>
          <button onClick={() => handleDeleteForm(item.id)}>Delete</button>
        </div>
      ))}
    </>
  );
}

export default App;
