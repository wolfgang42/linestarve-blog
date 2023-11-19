---
title: "How to split a git repository and follow directory renames"
tags: [Git]
---
<small>This is a mirror of my answer to [this StackOverflow question](https://stackoverflow.com/a/43985326/1979340).</small>

I had a very large repository from which I needed to extract a single folder; even `--index-filter` was predicted to take 8 hours to finish. Here's what I did instead.

<!--more-->

1. Obtain a list of all the past names of the folder. In my case there were only two, `old-name` and `new-name`.
2. For each name:

        $ git checkout master
        $ git checkout -b filter-old-name
        $ git filter-branch --subdirectory-filter old-name

    This will give you several disconnected branches, each containing history for one of the names.

3. The `filter-old-name` branch should *end* with the commit which renamed the folder, and the `filter-new-name` branch should *begin* with the same commit. (The same applies if there was more than one rename: you'll wind up with an equivalent number of branches, each with a commit shared with the next one along.) One should delete everything and the other should recreate it again. Make sure that these two commits have identical contents; if they don't, the file was modified in addition to being renamed, and you will need to merge the changes. (In my case I didn't have this problem so I don't know how to solve it.)
    
    An easy way to check this is to try rebasing `filter-new-name` on top of `filter-old-name` and then squashing the two commits together: git should complain that this produces an empty commit. (Note that you will want to do this on a spare branch and then delete it: rebasing deletes the Committer information from the commits, thus losing some of the history you want to keep.)

4. The next step is to [graft](https://git.wiki.kernel.org/index.php/GraftPoint) the two branches together, **skipping the two commits which renamed the folder.** (Otherwise there will be a weird jump where everything is deleted and recreated.) This involves finding the full SHA (all 40 characters!) of the two commits and putting them into git's info, with the *new* name branch's commit first, and the *old* name branch's commit second.

        $ echo $NEW_NAME_SECOND_COMMIT_SHA1 $OLD_NAME_PENULTIMATE_COMMIT_SHA1 >> .git/info/grafts

    If you've done this right, `git log --graph` should now show a line from the end of the new history to the start of the old history.

5. This graft is currently temporary: it is not yet part of the history, and won't follow along with clones or pushes. To make it permanent:

        $ git filter-branch

    This will refilter the branch without trying to make any further changes, making the graft permanent (changing all of the commits in the `filter-new-name` branch). You should now be able to delete the `.git/info/grafts` file.

At the end of all of this, you should now have on the `filter-new-name` branch all of the history from both names for the folder. You can then use this separate repository, or merge it into another one, or whatever you'd like to do with this history.
