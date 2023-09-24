import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject;

public class FirebaseAuthentication {

    private String apiKey;
    private String authUrl;
    private String loginUrl;
    private String verifyEmailUrl;
    private String passwordResetUrl;
    private String deleteUserUrl;
    private String emailChangeUrl;

    public FirebaseAuthentication(String apiKey) {
        this.apiKey = apiKey;
        this.authUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + apiKey;
        this.loginUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + apiKey;
        this.verifyEmailUrl = "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=" + apiKey;
        this.passwordResetUrl = "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=" + apiKey;
        this.deleteUserUrl = "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=" + apiKey;
        this.emailChangeUrl = "https://identitytoolkit.googleapis.com/v1/accounts:update?key=" + apiKey;
    }

    public JSONObject createUser(String email, String password) throws Exception {
        JSONObject userData = new JSONObject();
        userData.put("email", email);
        userData.put("password", password);
        userData.put("returnSecureToken", true);

        HttpURLConnection connection = createConnection(authUrl);
        sendRequest(connection, userData.toString());

        JSONObject response = readResponse(connection);
        return processResponse(response);
    }

    public JSONObject loginUser(String email, String password) throws Exception {
        JSONObject userData = new JSONObject();
        userData.put("email", email);
        userData.put("password", password);
        userData.put("returnSecureToken", true);

        HttpURLConnection connection = createConnection(loginUrl);
        sendRequest(connection, userData.toString());

        JSONObject response = readResponse(connection);
        return processResponse(response);
    }

    public JSONObject sendEmailVerification(String idToken) throws Exception {
        JSONObject data = new JSONObject();
        data.put("requestType", "VERIFY_EMAIL");
        data.put("idToken", idToken);

        HttpURLConnection connection = createConnection(verifyEmailUrl);
        sendRequest(connection, data.toString());

        JSONObject response = readResponse(connection);
        return processResponse(response);
    }

    public JSONObject sendPasswordResetEmail(String email) throws Exception {
        JSONObject data = new JSONObject();
        data.put("requestType", "PASSWORD_RESET");
        data.put("email", email);

        HttpURLConnection connection = createConnection(passwordResetUrl);
        sendRequest(connection, data.toString());

        JSONObject response = readResponse(connection);
        return processResponse(response);
    }

    public JSONObject deleteUser(String idToken) throws Exception {
        JSONObject data = new JSONObject();
        data.put("idToken", idToken);

        HttpURLConnection connection = createConnection(deleteUserUrl);
        sendRequest(connection, data.toString());

        JSONObject response = readResponse(connection);
        return processResponse(response);
    }

    public JSONObject changeEmail(String idToken, String newEmail) throws Exception {
        JSONObject data = new JSONObject();
        data.put("idToken", idToken);
        data.put("email", newEmail);
        data.put("returnSecureToken", true);

        HttpURLConnection connection = createConnection(emailChangeUrl);
        sendRequest(connection, data.toString());

        JSONObject response = readResponse(connection);
        return processResponse(response);
    }

    private HttpURLConnection createConnection(String url) throws Exception {
        URL apiUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) apiUrl.openConnection();

        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setDoOutput(true);

        return connection;
    }

    private void sendRequest(HttpURLConnection connection, String data) throws Exception {
        try (DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream())) {
            outputStream.writeBytes(data);
            outputStream.flush();
        }
    }

    private JSONObject readResponse(HttpURLConnection connection) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
            StringBuilder response = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                response.append(line);
            }

            return new JSONObject(response.toString());
        }
    }

    private JSONObject processResponse(JSONObject response) {
        if (response.has("idToken")) {
            return response;
        } else {
            JSONObject error = new JSONObject();
            error.put("success", false);
            error.put("error_code", response.getJSONObject("error").getString("code"));
            error.put("error_message", response.getJSONObject("error").getString("message"));
            error.put("error_details", response.getJSONObject("error").get("errors"));
            return error;
        }
    }
}
