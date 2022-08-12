import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Web3Storage } from "web3.storage";
import { FileError, FileRejection, useDropzone } from "react-dropzone";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdlYjhhQTFiQjU2YjRBYjQyOUJjNjFjOTZDMEY4ZWQ0N2I3ZTNmNzciLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDMxMDYwNTc2MTksIm5hbWUiOiJmcmVja2xlc19iZXRhIn0.LDAqENz1d3GDm03rHH12lyYPtES46B3qKfnsY1w249Q";

interface UploadableFile {
  file: File;
  errors: FileError[];
}

const App = () => {
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: "100vh",
        justifyContent: "space-between",
      }}
    >
      <Text
        style={{
          fontSize: "3rem",
          margin: "15vw",
          textAlign: "center",
          fontWeight: "800",
          marginVertical: "60px",
          padding: 0,
        }}
        numberOfLines={2}
      >
        Add your files and share them with the world ! 🌍
      </Text>

      <View
        style={{
          minWidth: "400px",
          maxWidth: "800px",
          minHeight: "400px",
          borderRadius: "15px",
          marginBottom: "25vh",
        }}
      >
        <Upload />
      </View>
    </View>

    /* <button onClick={() => test()}>Launch</button> */
    /* </View> */
  );
};

const Upload = () => {
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [CID, setCid] = useState<string>("");
  const [files, setFiles] = useState<UploadableFile[]>([]);
  const onDrop = useCallback((accFiles: File[], rejFiles: FileRejection[]) => {
    const mappedAcc = accFiles.map((file) => ({ file, errors: [] }));
    setFiles((curr) => [...curr, ...mappedAcc, ...rejFiles]);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  const onDelete = (file: File) => {
    setFiles((curr) => curr.filter((fw) => fw.file !== file));
  };

  const test = async (fichiers) => {
    const client = new Web3Storage({ token });
    console.log(fichiers);
    var files = [];
    for (let j = 0; j < fichiers.length; j++) {
      let file = fichiers[j].file;

      files.push(file);
    }
    console.log(files);
    storeWithProgress(files, client);
  };

  async function storeWithProgress(files, client) {
    const onRootCidReady = (cid: string) => {
      console.log("uploading files with cid:", cid);
      setCid(cid);
    };

    const totalSize = files.map((f) => f.size).reduce((a, b) => a + b, 0);
    let uploaded = 0;

    const onStoredChunk = (size) => {
      uploaded += size;
      console.log(totalSize, uploaded);
      const pct = (uploaded / totalSize) * 100;
      if (pct < 100) {
        setProgress(pct);
      } else {
        setProgress(100.0);
      }
      console.log(`Uploading... ${pct.toFixed(1)}% complete`);
    };
    setShowModal(true);
    return client.put(files, { onRootCidReady, onStoredChunk });
  }

  return (
    <React.Fragment>
      <div
        {...getRootProps()}
        style={{
          height: "100%",
          width: "100%",
          // backgroundColor: "rgb(235,235,235)",
          boxShadow: "0px 0px 50px lightgray",
          borderRadius: "15px",
          justifyContent: files.length > 0 ? "space-evenly" : "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <input {...getInputProps()} disabled={showModal} />
        {files.length > 0 ? (
          <Text
            style={{
              marginBottom: "40px",
              fontWeight: "600",
              marginTop: "20px",
            }}
          >
            Click background to add more files
          </Text>
        ) : (
          <Text style={{ fontWeight: "600" }}>
            Drag some files here, or click to upload
          </Text>
        )}
        {files.map((fileWrapper, i) => (
          <FileHeader key={i} file={fileWrapper.file} onDelete={onDelete} />
        ))}
        {files.length > 0 ? (
          <TouchableOpacity
            style={{
              marginTop: "40px",
              padding: "15px",
              borderRadius: "15px",
              // backgroundColor: "lightgray",
              boxShadow: "0px 0px 15px lightgray",
              marginBottom: "10px",
            }}
            onPress={() => test(files)}
          >
            <Text style={{ fontWeight: "600" }}>Upload 📡</Text>
          </TouchableOpacity>
        ) : null}
        {showModal ? <Modal progress={progress} cid={CID} /> : null}
      </div>
    </React.Fragment>
  );
};

interface FileHeaderProps {
  file: File;
  onDelete: (file: File) => void;
}

const FileHeader = ({ file, onDelete }: FileHeaderProps) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        width: "calc(100% - 80px)",
        justifyContent: "space-between",
        marginBottom: "10px",
      }}
    >
      <Text style={{ fontWeight: "500" }}>{file.name.substring(0, 30)}</Text>
      <TouchableOpacity onPress={() => onDelete(file)}>
        <Text>🗑</Text>
      </TouchableOpacity>
    </View>
  );
};

const Modal = (progress, cid) => {
  useEffect(() => {
    console.log("&", progress.progress);
  }, [progress]);
  useEffect(() => {
    console.log(progress.cid);
  }, [cid]);
  return (
    <View
      style={{
        position: "fixed",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        height: "100vh",
        width: "100vw",
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    >
      <View
        style={{
          padding: "20px",
          borderRadius: "15px",
          backgroundColor: "rgb(235, 235, 235)",
        }}
      >
        {progress.progress == 100 ? (
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ marginBottom: "20px", fontWeight: "600" }}>
              That's your link !
            </Text>
            <Text style={{ marginBottom: "10px" }}>
              Share it with whoever you want.
            </Text>
            <Text>https://{String(progress.cid)}.ipfs.dweb.link</Text>
          </View>
        ) : (
          <View>
            <Text style={{ marginBottom: "20px" }}>
              Your files are uploading...
            </Text>
            {/* <Text>{String(progress.progress).substring(0, 4)}%</Text> */}
            <ActivityIndicator color={"lightgray"} size={"large"} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;
