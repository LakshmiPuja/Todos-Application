//import { format, compareAsc } from 'date-fns';
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
var isValid = require("date-fns/isValid");
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB Error: '${e.message}'`);
    process.exit(1);
  }
};
initializeDbServer();

//API 1
app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q = " " } = request.query;

  switch (true) {
    //scenario 1
    case status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const getTodoStatusQuery = `SELECT id As id ,todo AS todo, priority As priority,status AS status,category AS category, due_date AS dueDate FROM todo WHERE status ='${status}';`;
        const todoStatusList = await db.all(getTodoStatusQuery);
        response.send(todoStatusList);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;
    //scenario 2
    case priority !== undefined:
      if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH") {
        const getTodoPriorityQuery = `SELECT id ,todo, priority,status,category, due_date AS dueDate FROM todo WHERE priority ='${priority}';`;
        const todoPriorityList = await db.all(getTodoPriorityQuery);
        response.send(todoPriorityList);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    //scenario 3
    case priority !== undefined && status !== undefined:
      if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          const getTodoStatusAndPriorityQuery = `SELECT id ,todo, priority,status,category, due_date AS dueDate FROM todo WHERE status ='${status}'AND priority ='${priority}';`;
          const todoStatusAndPriorityList = await db.all(
            getTodoStatusAndPriorityQuery
          );
          response.send(todoStatusAndPriorityList);
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    //scenario 4
    case search_q !== undefined:
      const getTodoQuery = `SELECT id ,todo, priority,status,category, due_date AS dueDate FROM todo WHERE todo LIKE '%${search_q}%';`;
      const todoList = await db.all(getTodoQuery);
      response.send(todoList);
      break;
    //scenario 5
    case category !== undefined && status !== undefined:
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          const getTodoCategoryAndStatusQuery = `SELECT id ,todo, priority,status,category, due_date AS dueDate FROM todo WHERE  category LIKE'${category}' AND status ='${status}';`;
          const todoCategoryAndStatusList = await db.all(
            getTodoCategoryAndStatusQuery
          );
          response.send(todoCategoryAndStatusList);
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    //scenario 6
    case category !== undefined:
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        const getTodoCategoryQuery = `SELECT id ,todo, priority,status,category, due_date AS dueDate FROM todo WHERE category ='${category}';`;
        const todoCategoryList = await db.all(getTodoCategoryQuery);
        response.send(todoCategoryList);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    //scenario 7
    case category !== undefined && priority !== undefined:
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        if (
          priority === "LOW" ||
          priority === "MEDIUM" ||
          priority === "HIGH"
        ) {
          const getTodoCategoryAndPriorityQuery = `SELECT id ,todo, priority,status,category, due_date AS dueDate FROM todo WHERE  category LIKE '%${category}%' AND priority = '${priority}';`;
          const todoTodoCategoryAndPriorityList = await db.all(
            getTodoTodoCategoryAndPriorityQuery
          );
          response.send(todoTodoCategoryAndPriorityList);
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoById = `SELECT id ,todo, priority,status,category, due_date AS dueDate FROM todo WHERE id = ${todoId};`;
  const todoById = await db.get(getTodoById);
  response.send(todoById);
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);
    const getTodoByDate = `SELECT id ,todo, priority,status,category, due_date AS dueDate FROM todo WHERE due_date='${newDate}';`;
    const todoByDate = await db.all(getTodoByDate);
    response.send(todoByDate);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    if (category === "HOME" || category === "WORK" || category == "LEARNING") {
      if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH") {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDate = format(new Date(dueDate), "yyyy-MM-dd");
          const addTodoQuery = `INSERT INTO 
      todo (id, todo, category,priority, status,due_date)
       VALUES(
           ${id},
           '${todo}', 
           '${category}',
           '${priority}', 
           '${status}', 
           ${postNewDate});`;
          await db.run(addTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateTodoQuery;
  const previousTodoQuery = `SELECT todo, status, priority, category , due_date AS dueDate FROM todo WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    status = previousTodo.status,
    priority = previousTodo.priority,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = requestBody;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `UPDATE 
                    todo 
                SET 
                status = '${status}',
                 priority = '${priority}',
                  todo = '${todo}',
                   category = '${category}',
                due_date = ${dueDate}
                 WHERE
                    id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestBody.priority !== undefined:
      if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH") {
        updateTodoQuery = `UPDATE 
                    todo 
                SET 
                status = '${status}',
                 priority = '${priority}',
                  todo = '${todo}',
                   category = '${category}',
                due_date = ${dueDate}
                WHERE
                    id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestBody.todo !== undefined:
      updateTodoQuery = `UPDATE 
        todo 
    SET 
       status = '${status}',
                 priority = '${priority}',
                  todo = '${todo}',
                   category = '${category}',
                due_date = ${dueDate}
    WHERE
        id = ${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      if (todo === undefined) {
        response.status(400);
        response.send("Invalid Todo");
      }
      break;
    case requestBody.category !== undefined:
      if (
        category === "HOME" ||
        category === "WORK" ||
        category == "LEARNING"
      ) {
        updateTodoQuery = `UPDATE 
                        todo 
                    SET 
                    status = '${status}',
                 priority = '${priority}',
                  todo = '${todo}',
                   category = '${category}',
                due_date = ${dueDate}
                    WHERE
                        id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDate = format(new Date(dueDate), "yyyy-MM-dd");
        console.log(newDate);
        updateTodoQuery = `UPDATE 
                    todo 
                SET
                 status = '${status}',
                 priority = '${priority}',
                  todo = '${todo}',
                   category = '${category}', 
                due_date = ${newDate}
                WHERE
                    id = ${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
