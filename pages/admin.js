// File: pages/admin.js
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showDonation, setShowDonation] = useState(true);
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  
  const handleLogin = async () => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  
    const result = await response.json();
  
    if (result.success) {
      setLoggedIn(true);
    } else {
      alert('Invalid credentials');
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetch('/api/admin/config')
      .then(res => res.json())
      .then(data => setShowDonation(Boolean(data.showDonation)));

    fetch('/api/admin/images')
      .then(res => res.json())
      .then(data => setImages(data.images)); // <-- use data.images
    }
  }, [loggedIn]);

  const handleToggleDonation = async () => {
    const newState = !showDonation;
    await fetch('/api/admin/toggle-donation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showDonation: newState }),  // <-- key is showDonation
    });
    setShowDonation(newState);
  };

  const handleUpload = async () => {
    if (!imageFile) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: reader.result }),
      });
      console.log('dayym');
      location.reload();
    };
    reader.readAsDataURL(imageFile);
  };

  if (!loggedIn) {
    return (
      
      <div style={{ padding: 50,display:'flex',width:'100%',height:'100vh',justifyContent:'center',alignItems:'center' }}>
         <div style={{ padding: 20 }}>
        <h2>Admin Login</h2>
        <br></br>
        <input placeholder="Username" onChange={e => setUsername(e.target.value)} /> <br />
        <br></br>
        <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} /> <br />
        <br></br>
        <button onClick={handleLogin}>Login</button></div>
      </div>
    );
  }

  return (

    
    <div style={{ padding: 20 }}>
      <h2>Admin Panel</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Donation Section: </label>
        <button onClick={handleToggleDonation}>
          {showDonation ? 'Hide' : 'Show'}
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Upload Image: </label>
        <input type="file" onChange={e => setImageFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload</button>
      </div>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Thumbnail</th>
            <th>Upload Date</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {images.map(img => (
            <tr key={img.id}>
              <td>
                <div
                  style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={img.image_base64}
                    width="60"
                    height="60"
                    style={{ borderRadius: '8px', cursor: 'pointer' }}
                    onMouseEnter={e => {
                      const popup = document.createElement('div');
                      popup.style.position = 'absolute';
                      popup.style.top = '0';
                      popup.style.left = '70px';
                      popup.style.borderRadius = '20px';
                      popup.style.zIndex = '999';
                      popup.style.border = '2px solid #ccc';
                      popup.style.background = '#fff';
                      popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
                      const imgLarge = document.createElement('img');
                      imgLarge.src = img.image_base64;
                      imgLarge.width = 200;
                      popup.appendChild(imgLarge);
                      popup.className = 'popup-preview';
                      e.currentTarget.parentElement.appendChild(popup);
                    }}
                    onMouseLeave={e => {
                      const popup = e.currentTarget.parentElement.querySelector('.popup-preview');
                      if (popup) popup.remove();
                    }}
                  />
                </div>
              </td>
              <td>{new Date(img.uploaded_at).toLocaleString()}</td>
              <td>{img.comment_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
