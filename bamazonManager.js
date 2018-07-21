// // Challenge #2: Manager View (Next Level)
// Create a new Node application called bamazonManager.js. Running this application will:
// List a set of menu options:
// View Products for Sale
// View Low Inventory
// Add to Inventory
// Add New Product
// If a manager selects View Products for Sale, the app should list every available item: the
// item IDs, names, prices, and quantities.
// If a manager selects View Low Inventory, then it should list all items with an inventory count
// lower than five.If a manager selects Add to Inventory, your app should display a prompt that will let the
// manager "add more" of any item currently in the store.
// If a manager selects Add New Product, it should allow the manager to add a completely new
// // product to the store.

var mysql = require('mysql');
var inquirer = require('inquirer');
var cTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "drew",
  password: "password1",
  database: "bamazon"
})

connection.connect(function (err) {
  if (err) throw err;

  console.log("connected!")

 // connection.end();

 displayProducts();
})

function displayProducts() {
  var choiceArray = [];

  connection.query("SELECT * FROM products", function (error, results, fields) {
    if (error) throw error;

    console.table(results);

    for (let i = 0; i < results.length; i++) {
        choiceArray.push(results[i].item);
      }
  
      promptManager(choiceArray);
    })
  }

  function promptManager(itemChoices) {
    inquirer.prompt([
      {
        type: "list",
        message: "What item would you like to update?",
        choices: itemChoices,
        name: "selectedItem"
          },
      {
        type: "input",
        message: "How many more of this item do you want to add?,
        name: "quantity"
      }
    ]).then(function (answers) {
      console.log(answers);
  
      if (Number.isInteger(parseInt(answers.quantity))) {
        checkInventory(answers.selectedItem, answers.quantity)
      } else {
        console.log("Item not purchase, please enter a valid number/integer")
      }
    })
  }


function checkInventory(item, quantity) {
    connection.query("SELECT inventory, price FROM products where item =?", [item],
      function (err, results, fields) {
        if (err) throw err;
  
        console.log(results);
  
        let itemsLeft = results[0].inventory;
        let itemPrice = results[0].price;
  
        let totalSale = itemPrice * quantity;
  
        if (itemsLeft - quantity >= 0) {
          console.log(`You just bought ${quantity} ${item}s for $${totalSale}`);
  
          updateDB(itemsLeft - quantity, item);
        } else {
          console.log(`Sorry insufficient quantity!`);
        }
  
  
      })
  }
  
  function updateDB(newQuanity, productName) {
    connection.query("UPDATE products SET ? WHERE ?",
      [{
        inventory: newQuanity
      }, {
        item: productName
      }], function (err, results, fields) {
        if (err) throw err;
  
        console.log("thanks for making a purchase!");
  

      })
  }
  

  connection.end();