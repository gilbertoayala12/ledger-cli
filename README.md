# Ledger.js

  

Implementation of ledger.cli on node.

  

### Prerequisites

  

You need to have installed

  

* nodejs.

  

### Installing

  

Run this command to install required modules

  

```

npm install

```

  
  

## Running the program

  

In your console run

  

```

$ bash my-ledger.sh <command>

```

  

### Sopported commands

  


  
#### Prints all supported commands
```

$ bash my-ledger.sh --help

```
### Prints all the files with given regex	
```

$ bash my-ledger.sh print [regex]

```
### Sort the given output by date
```

$ bash my-ledger.sh --sort <d> 

```
### Show all transactions and a running total
```

$ bash my-ledger.sh register

```
### Find all the balance off all your accounts
```

$ bash my-ledger.sh balance

```
### Specify the file name
To run this you'll have to run it without the `.sh` file.
```

$ node ledger.js --price-db prices_db -f <filename> <other commands>

```
### Specify your prices
To run this you'll have to run it without the `.sh` file.
```

$ node ledger.js --price-db <prices_file> -f <filename> <other commands>

```