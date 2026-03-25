import { createServiceRoleClient } from "./src/lib/supabase/service-role";

async function setupTestUser() {
  const email = "rahulv0406@gmail.com";
  const supabase = createServiceRoleClient();

  console.log(`Checking if user exists: ${email}`);
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("List users error:", listError);
    return;
  }

  const user = users.find(u => u.email === email);

  if (user) {
    console.log("User already exists:", user.id);
  } else {
    console.log("Creating user...");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: "Rahul V" }
    });

    if (createError) {
      console.error("Create user error:", createError);
      return;
    }
    console.log("User created successfully:", newUser.user.id);
  }

  // Ensure user profile exists
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (!profile) {
    console.log("Creating user profile...");
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: user?.id || "temporary-id-will-fail", // Need the real ID
        email,
        full_name: "Rahul V",
        is_business_owner: true,
        kyc_status: "VERIFIED"
      });
    if (profileError) console.error("Profile error:", profileError);
  } else {
    console.log("Profile exists.");
  }
}

setupTestUser();
