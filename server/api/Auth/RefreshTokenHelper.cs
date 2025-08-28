// Auth/RefreshTokenHelper.cs
using System.Security.Cryptography;
using System.Text;

namespace api.Auth;

public static class RefreshTokenHelper
{
    public static string GenerateRawToken(int bytes = 64)
    {
        var data = RandomNumberGenerator.GetBytes(bytes);
        return Convert.ToBase64String(data); // store only the hash in DB
    }

    public static string Sha256(string input)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToBase64String(bytes);
    }
}