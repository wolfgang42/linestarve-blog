---
title: "A tiny plaintext accounting tool"
tags: [Python, accounting]
---
I have been doing some financial planning, and needed to make sure I hadn’t gotten mixed up when trying to keep track of how much money will be where at some point in the future as I shuffle it around between accounts. The spreadsheet I tried to build got unwieldy quickly and I decided I needed a special-purpose tool. I’ve heard of [hledger](https://hledger.org/) and [beancount](https://beancount.github.io/), and briefly tried them out a few years ago, but they do way more than I needed for this task and I wanted to avoid getting distracted by learning a new tool. So in the end I coded up a special-purpose tool to help, and it seemed interesting enough that I decided to write about it here.

<!--more-->

## Requirements

* A format to say what I plan to do; for convenience, I want to support arbitrary splits (“<span>$</span>1800 from savings and <span>$</span>500 from checking, going to <span>$</span>2000 in rent and <span>$</span>300 in health insurance”).
* Validation that every transaction balances, to make sure my plan doesn’t involve getting money out of thin air.
* Validation that no account goes negative.
* A way to say what I *think* the balance in an account should be at a certain point, so I can pin down my assumptions and make sure they stay true as I refine the plan.
* Comments, so I can leave myself notes.

(These last two were the big shortcomings in my spreadsheet-based approach; I couldn’t figure out a good place to keep this information as I moved rows around.)

## File format
Before writing any code, I started writing out my data and defining the text format. Doing this first means that ‘refactoring’ is a lot easier: when I make a change, I just need to make it look nice to me, I don’t have to worry about making the computer happy with it. Plus, there was a chance that just writing down my plan in a way that made sense to me would be enough to help me solve my confusion, and I wouldn’t actually have to write any code to validate it at all.

After a bit of experimentation, I ended up with a format I was happy with. Transactions start with <code>*<var>description</var></code>, followed by an indented set of postings, formatted as <code><var>amount</var>&gt;<var>account</var></code>, with the direction of the angle bracket indicating whether money is going into or out of the account. (I could have done this with positive and negative values, but then income appears as a negative number which is confusing. Traditionally accountants avoid this by classifying accounts as “asset” or “liability” and swapping whether increases are a debit or a credit accordingly, but that’s more than I need or want to implement right now.) All of the amounts in a transaction should sum to zero, to ensure that I haven’t created money out of thin air; if not, a message will be printed when I validate the file.
```
*Example transaction
	2400<Checking
	2000>Rent
	400>Health insurance
```

I can also assert that the balance of an account is what I think it is; this is useful, for example, to check that I haven’t accidentally planned to leave more money than I need in an account at the end of a series of transactions:
```
=1000 Checking
```

There’s also a simple comment syntax:
```
# This is a comment
```

And finally, a command to print the balances of all open accounts at any given point, so I can eyeball it and make sure things look sensible:
```
!balances
```

## The code
After making a good start on writing down my planned transactions, and having figured out my file format, I decided that I really did need to write some code after all; but only it only took about 60 lines worth to do what I needed:
```python
import re, sys
from collections import defaultdict

TXN_LINE = re.compile('^\t([0-9]+(?:,[0-9]{3})?)([<>])(.+)$') # \t 1,500>Savings
BAL_ASSERT_LINE = re.compile('^=([0-9]+) (.+)$') # =1000 Checking

balances = defaultdict(lambda: 0)
cur_txn_desc = None
cur_txn_total = 0
prev_txn_desc = None

def end_current_transaction():
	global cur_txn_desc, cur_txn_total, prev_txn_desc
	if cur_txn_desc is None: return # No open transaction to end
	if cur_txn_total != 0:
		# Transaction does not balance (funds unaccounted for)
		print(cur_txn_desc, cur_txn_total)
	# Mark transaction closed and prepare for the next one
	prev_txn_desc = cur_txn_desc
	cur_txn_total = 0
	cur_txn_desc = None

for line in sys.stdin:
	line = line.rstrip() # Remove newline
	if (line.strip() == ''
			or line.startswith('#')
			or line.startswith('\t#')):
		pass # Ignore blank/comment lines
	elif line == '!balances':
		end_current_transaction()
		print(f'=== Balance as of {prev_txn_desc} ===')
		for k, v in balances.items():
			if v == 0: continue
			print(k, v)
		print()
	elif line.startswith('='): # Balance assertion
		end_current_transaction()
		match = BAL_ASSERT_LINE.match(line)
		if not match: raise Exception(f"Failed to match {line}")
		amount, account = match.group(1, 2)
		amount = int(amount)
		if balances[account] != amount:
			# Balance assertion failed
			print(f"={amount} {account} {balances[account]}")
	elif line.startswith('*'): # Transaction
		end_current_transaction()
		cur_txn_desc = line
	elif line.startswith('\t'): # Posting under transaction
		if cur_txn_desc is None:
			raise Exception(f"No transaction open, but found {line}")
		match = TXN_LINE.match(line)
		if not match: raise Exception(f"Failed to match {line}")
		amount, direction, account = match.group(1, 2, 3)
		amount = int(amount.replace(',', ''))
		if direction == '<': amount = -amount
		
		cur_txn_total += amount
		balances[account] += amount
		if balances[account] < 0: # Account has gone negative
			print(cur_txn_desc, account, balances[account])
	else:
		raise Exception(f"Invalid line: {line}")
end_current_transaction()
```

I admit that this isn’t quite the easiest thing to read. It’s written to take a single pass over the data, keeping track of what transaction it’s in the middle of and starting a new one whenever it encounters a non-posting line. If it got bigger and harder to follow I think I would split it up into a pipeline so that, for example, grouping a transaction’s postings together could live in a separate function instead of every command needing to `end_current_transaction()` or risk confusing results. For the moment, the program is small enough that this doesn’t matter too much, so I didn’t want to spend time thinking about how to refactor it.

## Conclusion
There’s something to be said for one-off, throwaway programs. I know this code isn’t the greatest quality; small as it is, I wouldn’t be surprised if it has bugs. But I only wanted it to run on one file, and it’s done that job admirably. If I ever need it again in the future, it’s small enough to be easily malleable; I could probably rewrite the whole thing from scratch in half an hour or so (it did take me longer the first time, partly because I did have to restructure it halfway through writing it once I got a better grasp on the problem, and partly because I was also doing actual budgeting at the same time).

I have a number of programs like this that I’ve written for myself. It’s kind of nice, even if the code is buggy, to have something that’s molded to suit my personal preference, beholden to no one else. Besides, at least this way I know where the bugs are; even if I haven’t gotten around to fixing them yet, well, at least I *could* someday, and that’s an inspiring thought. Build your own tools, and at a minimum you’ll learn what works and what doesn’t. You might even get something useful out of it!
