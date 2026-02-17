import express from "express";
import { readFromFile, writeFromFile } from "./modules/filehandler.js";

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// HOME PAGE
app.get('/', async (req, res) => {
    try {
        const employees = await readFromFile();
        const search = req.query.search?.toLowerCase() || "";

        const filteredEmployees = employees.filter(emp =>
            emp.name.toLowerCase().includes(search) ||
            emp.department.toLowerCase().includes(search)
        );

        //Total Salary Calculation
        const totalSalary = filteredEmployees.reduce(
            (sum, emp) => sum + emp.salary, 0
        );

        res.render("index", {
            employees: filteredEmployees,
            totalSalary,
            search
        });

    } catch (err) {
        res.status(500).send("Failed");
    }
});



//  ADD PAGE 
app.get("/add", (req, res) => {
    res.render("add");
});


//  ADD EMPLOYEE 
app.post("/add", async (req, res) => {
    try {
        let { name, department, salary } = req.body;

        name = name?.trim();
        department = department?.trim();
        salary = Number(salary);

        // Strong Validation
        if (!name || !department || isNaN(salary) || salary < 0) {
            return res.send("Invalid input: Name & Department required, Salary must be positive number.");
        }

        const employees = await readFromFile();

        const newEmployee = {
            id: Date.now(),   // Unique ID
            name,
            department,
            salary
        };

        employees.push(newEmployee);

        await writeFromFile(employees);

        res.redirect("/");   // Required Redirect

    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding employee");
    }
});


//  DELETE 
app.get("/delete/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        let employees = await readFromFile();

        employees = employees.filter(emp => emp.id !== id);

        await writeFromFile(employees);

        res.redirect("/");   //  Required Redirect

    } catch (err) {
        res.status(500).send("Delete failed");
    }
});


// EDIT PAGE 
app.get("/edit/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const employees = await readFromFile();

        const employee = employees.find(emp => emp.id === id);

        if (!employee) return res.send("Employee not found");

        res.render("edit", { employee });

    } catch (err) {
        res.status(500).send("Error loading edit page");
    }
});


//  UPDATE EMPLOYEE 
app.post("/edit/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        let { name, department, salary } = req.body;

        name = name?.trim();
        department = department?.trim();
        salary = Number(salary);

        //  Strong Validation
        if (!name || !department || isNaN(salary) || salary < 0) {
            return res.send("Invalid input: Name & Department required, Salary must be positive number.");
        }

        const employees = await readFromFile();

        const updatedEmployees = employees.map(emp => {
            if (emp.id === id) {
                return {
                    ...emp,
                    name,
                    department,
                    salary
                };
            }
            return emp;
        });

        await writeFromFile(updatedEmployees);

        res.redirect("/");   // Required Redirect

    } catch (err) {
        res.status(500).send("Update failed");
    }
});


const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port:${PORT}`);
});
