# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.3.x   | Yes       |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Report it privately through [GitHub security advisories](https://github.com/anastomotic-ai/anastomotic/security/advisories/new)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- Acknowledgment within 48 hours
- Regular updates on progress
- Credit in release notes (if desired)

### Scope

Security issues we're interested in:

- Remote code execution
- Local privilege escalation
- Data exposure
- Authentication/authorization bypasses
- IPC security issues

Out of scope:

- Denial of service
- Social engineering
- Issues requiring physical access

## Security Best Practices

When using Anastomotic:

- Keep the application updated
- Only grant file permissions when necessary
- Review task outputs before approving sensitive operations
- Use API keys with minimal required permissions
