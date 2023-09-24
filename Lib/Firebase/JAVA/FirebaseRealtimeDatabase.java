import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class FirebaseRealtimeDatabase {

    private String databaseUrl;

    public FirebaseRealtimeDatabase() {
        this.databaseUrl = "https://alor28-default-rtdb.asia-southeast1.firebasedatabase.app";
    }

    public String readData(String path) throws Exception {
        String dbRef = databaseUrl + "/" + path + ".json";
        HttpURLConnection connection = createConnection(dbRef);

        if (connection.getResponseCode() == 200) {
            return readResponse(connection);
        } else {
            System.out.println("Error reading data from the database: " + connection.getResponseCode());
            return null;
        }
    }

    public boolean writeData(String path, String data) throws Exception {
        String dbRef = databaseUrl + "/" + path + ".json";
        HttpURLConnection connection = createConnection(dbRef);

        connection.setRequestMethod("PUT");
        sendRequest(connection, data);

        if (connection.getResponseCode() == 200) {
            return true;  // Indicate success
        } else {
            System.out.println("Error writing data to the database: " + connection.getResponseCode());
            return false;
        }
    }

    public boolean updateData(String path, String data) throws Exception {
        String dbRef = databaseUrl + "/" + path + ".json";
        HttpURLConnection connection = createConnection(dbRef);

        connection.setRequestMethod("PATCH");
        sendRequest(connection, data);

        if (connection.getResponseCode() == 200) {
            return true;  // Indicate success
        } else {
            System.out.println("Error updating data in the database: " + connection.getResponseCode());
            return false;
        }
    }

    public boolean deleteData(String path) throws Exception {
        String dbRef = databaseUrl + "/" + path + ".json";
        HttpURLConnection connection = createConnection(dbRef);

        connection.setRequestMethod("DELETE");

        if (connection.getResponseCode() == 200) {
            return true;  // Indicate success
        } else {
            System.out.println("Error deleting data from the database: " + connection.getResponseCode());
            return false;
        }
    }

    private HttpURLConnection createConnection(String url) throws Exception {
        URL apiUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) apiUrl.openConnection();
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setDoOutput(true);
        return connection;
    }

    private void sendRequest(HttpURLConnection connection, String data) throws Exception {
        try (DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream())) {
            outputStream.write(data.getBytes("UTF-8"));
            outputStream.flush();
        }
    }

    private String readResponse(HttpURLConnection connection) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
            StringBuilder response = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                response.append(line);
            }

            return response.toString();
        }
    }
}
