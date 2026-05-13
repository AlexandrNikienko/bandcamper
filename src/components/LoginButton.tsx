import { Button } from "antd";
import { GoogleIcon } from "../utils/icons";
import { useAuth } from "../AuthProvider";

export function LoginButton() {
  const { login } = useAuth();

  const loginWithGoogle = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <Button onClick={loginWithGoogle}>
      Sign in with <GoogleIcon />
    </Button>
  );
}
