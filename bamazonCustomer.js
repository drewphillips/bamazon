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

    promptCustomer(choiceArray);
  })
}

function promptCustomer(itemChoices) {
  inquirer.prompt([
    {
      type: "list",
      message: "What item would you like to buy?",
      choices: itemChoices,
      name: "selectedItem"
    },
    {
      type: "input",
      message: "Great! How many would you like to buy?",
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


      connection.end();
    })
}


