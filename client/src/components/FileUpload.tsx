import { ChangeEvent, useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectFile = e.target.files ? e.target.files[0] : null;
    console.log(selectFile?.name);

    if (selectFile && selectFile.name.split(".")[1] === "twee") {
      setFile(selectFile);
    } else {
      alert("Please upload a .twee file");
    }
  };

  const onFileUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file, file.name);

      axios.post("http://localhost:3001/api/files/upload", formData).then((res) => {
        console.log(res.data);
      });
    }
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Upload</button>
    </div>
  );
};

export default FileUpload;
