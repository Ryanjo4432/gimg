import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [latestImage, setLatestImage] = useState(null);
  const [showDonation, setShowDonation] = useState(false);
  const [donationLink, setDonationLink] = useState(""); // NEW
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    // Fetch latest image
    fetch("/api/admin/images")
    .then((res) => res.json())
    .then((data) => {
      if (data.images && data.images.length > 0) {
        const latest = data.images[0];
        setLatestImage(latest);

        // Fetch comments for this image
        fetch(`/api/comments?image_id=${latest.id}`)
          .then((res) => res.json())
          .then((data) => {
            setComments(data.comments || []);
          });
      }
    });

    // Fetch donation toggle
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        setShowDonation(Boolean(data.showDonation));
        setDonationLink(data.donationLink); // NEW
      });

   
    // Load stored username
    const savedName = localStorage.getItem("username");
    if (savedName) setUsername(savedName);
  }, []);

  const generateRandomName = () =>
    "Guest-" + Math.floor(1000 + Math.random() * 9000);

  const handleSendComment = async () => {
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;

    let nameToUse = username.trim() || generateRandomName();
    localStorage.setItem("username", nameToUse);

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nameToUse,
        comment: trimmedComment,
        image_id: latestImage?.id,
      }),
    });

    if (response.ok) {
      const newComment = await response.json();
      setComments((prev) => [newComment, ...prev]);
      setComment("");
    }
  };

  const recentComments = comments;

  return (
    <>
      <Head>
        <title>Daily Pictures</title>
        <meta name="description" content="Daily picture feed" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://images.steamusercontent.com/ugc/793110129242416673/6916E46E80B0A91A27B465BAF80C7CB72C46B0EA/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false" />
      </Head>

      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "1rem",
        }}
      >
       <main
  className={styles.main}
  style={{
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "1200px",
    gap: "0.5rem",
  }}
>
  <div 
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.51rem",
      width: "100%",
    }}
    className={styles.leftside}
    
  >
    <h1 style={{ textAlign: "center" }}>Today's Image</h1>
    {latestImage ? (
      <>
        <Image
          src={latestImage.image_base64}
          alt="Latest Upload"
          width={600}
          height={600}
          style={{
            objectFit: "cover",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            width: "100%",
            height: "auto",
          }}
          placeholder="blur"
          blurDataURL={latestImage.image_base64}
        />
        <p style={{ color: "#555", textAlign: "center",fontSize:"4px" }}>
          Uploaded on: {new Date(latestImage.uploaded_at).toLocaleDateString()}
        </p>
      </>
    ) : (
      <p>No image uploaded yet.</p>
    )}

    {showDonation && donationLink &&(
      <div className={styles.dntdiv}
      
      >
        <h3 style={{ color: "#000", fontSize: "11px" }}>Support Us ❤️ keeps us going!</h3>
        <a href={donationLink} target="_blank"
    rel="noopener noreferrer"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          Donate Now
        </a>
      </div>
    )}
  </div>

  {/* Comments Section */}
  <div
    className={styles.rightside}
    style={{
      flex: 1,
      width: "100%",
    }}
  >
    <h3 className={styles.cmttitle}>Comments</h3>
    <div
    className={styles.comntcon}
      style={{
        maxHeight: "250px",
        overflowY: comments.length > 3 ? "scroll" : "visible",
        border: "1px solid #ddd",
        padding: "1rem",
        borderRadius: "8px",
        backgroundColor: "#dfdeee",
      }}
    >
      {recentComments.map((c, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "row" }}>
          <div
            style={{
              borderRadius: "45px",
              backgroundColor: "black",
              height: "10px",
              width: "10px",
              margin: "10px",
            }}
          ></div>
          <div style={{ marginBottom: "1rem" }}>
            <strong style={{ color: "#000" }}>{c.name}</strong>
            <p style={{ margin: "0.2rem 0", color: "black" }}>{c.comment}</p>
          </div>
        </div>
      ))}
      {comments.length === 0 && (
        <p style={{ color: "#000" }}>No comments yet. Be the first!</p>
      )}
    </div>

    <div style={{ marginTop: "1rem" }}>
      <input
        type="text"
        placeholder="Enter your name (optional)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: "0.5rem",
          marginBottom: "0.5rem",
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />
      <textarea
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          padding: "0.5rem",
          border: "1px solid #ccc",
          borderRadius: "6px",
          resize: "none",
        }}
      />
      <button
        onClick={handleSendComment}
        disabled={comment.trim().length === 0}
        style={{
          marginTop: "0.5rem",
          width: "100%",
          padding: "0.5rem",
          backgroundColor:
            comment.trim().length === 0 ? "#ccc" : "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: comment.trim().length === 0 ? "not-allowed" : "pointer",
        }}
      >
        Send
      </button>
    </div>
  </div>
</main>


        <footer className={styles.footer}></footer>
      </div>
    </>
  );
}
