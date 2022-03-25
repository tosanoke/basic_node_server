import http, { IncomingMessage, Server, ServerResponse } from "http";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";


const isExist = fs.existsSync("/Users/decagon/Desktop/server/data/data.json");

if (isExist === false) {
  fs.writeFileSync("/Users/decagon/Desktop/server/data/data.json", "[]");
}

let userData = require("/Users/decagon/Desktop/server/data/data.json");

/*
implement your server code here
*/

interface UsersInfo {
  id?: string;
  organization?: string;
  createdAt?: string;
  updatedAt?: string;
  products?: string[];
  marketValue?: string;
  address?: string;
  ceo?: string;
  country?: string;
  noOfEmployees?: number;
  employees?: string[];
}




// -------------- functions for CRUD operations -----------------------------

//function to writefile to database
function writeDataToFile(filename: number | fs.PathLike, content: any) {
  fs.writeFileSync(filename, JSON.stringify(content, null, 3), { flag: "w" });
}
// function to recieve POST data and resolve it
function getPostData(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        resolve(body);
      });
    } catch (error) {
      reject(error);
    }
  });
}
// function to find user by ID:  returns the user with the given ID
function userId(id: string): Promise<object> {
  return new Promise((resolve) => {
    const user = userData.find((user: { id: string }) => user.id === id);
    resolve(user);
  });
}
// function to update database: recieves an id and the userObject daata makes and updates the database
function update(id: string, usersData: UsersInfo) {
  return new Promise((resolve) => {
    const index = userData.findIndex((p: { id: string }) => p.id === id);
    userData[index] = { id, ...usersData };
    writeDataToFile(
      "/Users/decagon/Desktop/server/data/data.json",
      userData
    );
    resolve(userData[index]);
  });
}
//remove data based on ID and updates the database
function remove(id: string) {
  return new Promise<void>((resolve) => {
    userData = userData.filter((p: { id: string }) => p.id !== id);
    writeDataToFile(
      "/Users/decagon/Desktop/server/data/data.json",
      userData
    );
    resolve();
  });
}



// ----------------Controllers----------------

// getUsers: returns all objects in the database
async function getUsers(res: http.ServerResponse) {
  try {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(userData));
  } catch (error) {
    console.log(error);
  }
}

// GetUserByID: returns a single user object based on the  userId  
async function getUserById(
  res: http.ServerResponse,
  id: string
) {
  try {
    const user = await userId(id);

    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User Not Found" }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    }
  } catch (error) {
    console.log(error);
  }
}

// createUser: creates a new User object based on a post request
async function createUser(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    const body = await getPostData(req);
    const data = JSON.parse(body);

    const newUser = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    userData.push(newUser);
    writeDataToFile(
      "/Users/decagon/Desktop/server/data/data.json",
      userData
    );
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(userData));
  } catch (error) {
    console.log(error);
  }
}

// updateUserInfo: updates a existing user info using a PUT request and ID
async function updateUser(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  id: string
) {
  try {
    let user: UsersInfo = await userId(id);

    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "User object Not Found" }));
    } else {
      const body = await getPostData(req);

      const {
        createdAt,
        updatedAt,
        organization,
        products,
        marketValue,
        address,
        ceo,
        country,
        noOfEmployees,
        employees,
      } = JSON.parse(body);

      const usersData: UsersInfo = {
        createdAt: createdAt || user.createdAt,
        updatedAt: updatedAt || new Date().toISOString(),
        organization: organization || user.organization,
        products: products || user.products,
        marketValue: marketValue || user.marketValue,
        address: address || user.address,
        ceo: ceo || user.ceo,
        country: country || user.country,
        noOfEmployees: noOfEmployees || user.noOfEmployees,
        employees: employees || user.employees,
      };

      const updUser = await update(id, usersData);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(updUser));
    }
  } catch (error) {
    console.log(error);
    return;
  }
}

// deleteUser: deletes a user from the database based on their id 
async function deleteUser(
  res: http.ServerResponse,
  id: string
) {
  try {
    const user = await userId(id);
    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User not found" }));
    } else {
      await remove(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: `User ${id} removed` }));
    }
  } catch (error) {
    console.log(error);
  }
}


// ------------application----------------------

const requestListener = function (req: IncomingMessage, res: ServerResponse) {
  if (req.url === "/api/data" && req.method === "GET") {
    getUsers(res);
  } else if (req.url?.match(/\/api\/data\/\w+/) && req.method === "GET") {
    const id = req.url.split("/")[3];
    getUserById(res, id);
  } else if (req.url === "/api/data" && req.method === "POST") {
    createUser(req, res);
  } else if (req.url?.match(/\/api\/data\/\w+/) && req.method === "PUT") {
    const id = req.url.split("/")[3];
    updateUser(req, res, id);
  } else if (req.url?.match(/\/api\/data\/\w+/) && req.method === "DELETE") {
    const id = req.url.split("/")[3];
    deleteUser(res, id);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User Not Found" }));
  }
};

// server
const PORT = 5000;
export const server: Server = http.createServer(requestListener);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
