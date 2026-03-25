---
name: git-workflow
description: Full git workflow assistant — branching, PRs, conflict resolution, rebasing, cherry-picking, bisecting, stashing, and GitHub CLI integration.
command: /git-workflow
verified: true
---

# Git Workflow Assistant

A comprehensive skill covering the full git workflow beyond simple commits.

## Branch Management

### Creating Branches

```bash
# Feature branch from latest main
git checkout main && git pull origin main
git checkout -b feat/<ticket>-<short-description>

# Fix branch
git checkout -b fix/<ticket>-<short-description>
```

### Branch Naming Convention

- `feat/ENG-123-add-login` — new feature
- `fix/ENG-456-null-pointer` — bug fix
- `refactor/ENG-789-extract-service` — refactoring
- `chore/update-deps` — maintenance

## Pull Request Workflow

### Creating a PR (GitHub CLI)

```bash
# Push branch and create PR
git push -u origin HEAD
gh pr create --title "feat(scope): description" --body "## Summary\n..." --base main
```

### Reviewing a PR

```bash
gh pr list
gh pr view <number>
gh pr diff <number>
gh pr checkout <number>   # Check out locally to test
gh pr review <number> --approve
gh pr review <number> --request-changes --body "feedback..."
```

### Merging

```bash
gh pr merge <number> --squash --delete-branch
```

## Conflict Resolution

1. Identify the conflicting files: `git status`
2. Open each file and look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Resolve by choosing the correct version or merging both
4. Stage resolved files: `git add <file>`
5. Continue the operation: `git rebase --continue` or `git merge --continue`

## Rebasing

```bash
# Interactive rebase to squash/reorder commits
git rebase -i HEAD~<n>

# Rebase onto latest main
git fetch origin
git rebase origin/main

# Abort if stuck
git rebase --abort
```

## Cherry-Picking

```bash
git cherry-pick <commit-hash>
git cherry-pick <hash1> <hash2>   # Multiple commits
git cherry-pick --abort            # If conflicts arise
```

## Stashing

```bash
git stash                    # Stash working changes
git stash list               # List stashes
git stash pop                # Apply and remove latest stash
git stash apply stash@{1}    # Apply specific stash
git stash drop stash@{0}     # Remove a stash
```

## Bisecting (Finding Bug-Introducing Commits)

```bash
git bisect start
git bisect bad                # Current commit is bad
git bisect good <commit>      # Known good commit
# Git checks out mid-point — test and mark:
git bisect good   # or
git bisect bad
# Repeat until the offending commit is found
git bisect reset
```

## Log and History

```bash
git log --oneline --graph --all -20
git log --author="name" --since="1 week ago"
git log --follow -- <file>        # History of a specific file
git blame <file>                  # Who changed each line
git diff main..HEAD --stat        # Changed files summary
```

## Undoing Changes

```bash
git restore <file>              # Discard working changes
git restore --staged <file>     # Unstage a file
git reset --soft HEAD~1         # Undo last commit, keep changes staged
git revert <commit>             # Create a new commit that undoes a commit
```

## GitHub Issue Integration

```bash
gh issue list
gh issue view <number>
gh issue create --title "Bug: ..." --body "Steps to reproduce..."
gh issue close <number>
```

## Best Practices

- Always pull latest main before branching
- Keep PRs small and focused (< 400 lines)
- Write descriptive PR titles using conventional format
- Never force-push a branch with an open PR
- Use `--no-verify` only when you understand the skipped checks
- Review your own diff before pushing

## Examples

- "Create a feature branch and PR for the new search feature"
- "Rebase my branch onto main and resolve conflicts"
- "Find which commit broke the login test using bisect"
- "Stash my changes, switch to main, then re-apply"
- "Cherry-pick commit abc123 into the release branch"
