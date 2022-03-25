"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const isExist = fs_1.default.existsSync("/Users/decagon/Desktop/server/data/data.json");
if (isExist === false) {
    fs_1.default.writeFileSync("/Users/decagon/Desktop/server/data/data.json", "[]");
}
let userData = require("/Users/decagon/Desktop/server/data/data.json");
function writeDataToFile(filename, content) {
    fs_1.default.writeFileSync(filename, JSON.stringify(content, null, 3), { flag: "w" });
}
function getPostData(req) {
    return new Promise((resolve, reject) => {
        try {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString();
            });
            req.on("end", () => {
                resolve(body);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
function userId(id) {
    return new Promise((resolve) => {
        const user = userData.find((user) => user.id === id);
        resolve(user);
    });
}
function update(id, usersData) {
    return new Promise((resolve) => {
        const index = userData.findIndex((p) => p.id === id);
        userData[index] = { id, ...usersData };
        writeDataToFile("/Users/decagon/Desktop/server/data/data.json", userData);
        resolve(userData[index]);
    });
}
function remove(id) {
    return new Promise((resolve) => {
        userData = userData.filter((p) => p.id !== id);
        writeDataToFile("/Users/decagon/Desktop/server/data/data.json", userData);
        resolve();
    });
}
async function getUsers(res) {
    try {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(userData));
    }
    catch (error) {
        console.log(error);
    }
}
async function getUserById(res, id) {
    try {
        const user = await userId(id);
        if (!user) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "User Not Found" }));
        }
        else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(user));
        }
    }
    catch (error) {
        console.log(error);
    }
}
async function createUser(req, res) {
    try {
        const body = await getPostData(req);
        const data = JSON.parse(body);
        const newUser = {
            id: (0, uuid_1.v4)(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...data,
        };
        userData.push(newUser);
        writeDataToFile("/Users/decagon/Desktop/server/data/data.json", userData);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(userData));
    }
    catch (error) {
        console.log(error);
    }
}
async function updateUser(req, res, id) {
    try {
        let user = await userId(id);
        if (!user) {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "User object Not Found" }));
        }
        else {
            const body = await getPostData(req);
            const { createdAt, updatedAt, organization, products, marketValue, address, ceo, country, noOfEmployees, employees, } = JSON.parse(body);
            const usersData = {
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
    }
    catch (error) {
        console.log(error);
        return;
    }
}
async function deleteUser(res, id) {
    try {
        const user = await userId(id);
        if (!user) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "User not found" }));
        }
        else {
            await remove(id);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: `User ${id} removed` }));
        }
    }
    catch (error) {
        console.log(error);
    }
}
const requestListener = function (req, res) {
    var _a, _b, _c;
    if (req.url === "/api/data" && req.method === "GET") {
        getUsers(res);
    }
    else if (((_a = req.url) === null || _a === void 0 ? void 0 : _a.match(/\/api\/data\/\w+/)) && req.method === "GET") {
        const id = req.url.split("/")[3];
        getUserById(res, id);
    }
    else if (req.url === "/api/data" && req.method === "POST") {
        createUser(req, res);
    }
    else if (((_b = req.url) === null || _b === void 0 ? void 0 : _b.match(/\/api\/data\/\w+/)) && req.method === "PUT") {
        const id = req.url.split("/")[3];
        updateUser(req, res, id);
    }
    else if (((_c = req.url) === null || _c === void 0 ? void 0 : _c.match(/\/api\/data\/\w+/)) && req.method === "DELETE") {
        const id = req.url.split("/")[3];
        deleteUser(res, id);
    }
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User Not Found" }));
    }
};
const PORT = 5000;
exports.server = http_1.default.createServer(requestListener);
exports.server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
