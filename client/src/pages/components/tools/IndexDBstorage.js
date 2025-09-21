// Open or create an IndexedDB
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("MyDatabase", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("articles", { keyPath: "id" });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Error opening database:", event);
    };
  });
};

// Set data in IndexedDB
export const setItem = async (key, value) => {
  const db = await openDatabase();
  const transaction = db.transaction("articles", "readwrite");
  const store = transaction.objectStore("articles");

  const data = { id: key, content: value };

  const request = store.put(data);

  request.onsuccess = () => {
    console.log("Data saved successfully");
  };

  request.onerror = (event) => {
    console.error("Error saving data:", event);
  };
};

// Get data from IndexedDB
export const getItem = async (key) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("articles", "readonly");
    const store = transaction.objectStore("articles");

    const request = store.get(key);

    request.onsuccess = (event) => {
      if (event.target.result) {
        resolve(event.target.result.content);
      } else {
        resolve(null); // Return null if no content is found
      }
    };

    request.onerror = (event) => {
      reject("Error retrieving data:", event);
    };
  });
};

// Remove data from IndexedDB
export const removeItem = async (key) => {
  const db = await openDatabase();
  const transaction = db.transaction("articles", "readwrite");
  const store = transaction.objectStore("articles");

  const request = store.delete(key); // Delete the content by its key

  request.onsuccess = () => {
    console.log("Data removed successfully");
  };

  request.onerror = (event) => {
    console.error("Error removing data:", event);
  };
};
