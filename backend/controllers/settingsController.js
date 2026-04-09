const supabase = require("../config/supabase");

const SETTINGS_ID = '00000000-0000-0000-0000-000000000000';

exports.getSettings = async (req, res) => {
  try {
    let { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (!settings) {
      // Create default settings if they don't exist
      const { data: newSettings, error: insertError } = await supabase
        .from('settings')
        .insert([{ 
          id: SETTINGS_ID,
          siteTitle: "Text Africa Arcade",
          defaultCategory: "General",
          theme: "light"
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      settings = newSettings;
    }
    res.json(settings);
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .upsert({ ...req.body, id: SETTINGS_ID })
      .select()
      .single();

    if (error) throw error;
    res.json(settings);
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(400).json({ error: "Failed to update settings", details: err.message });
  }
};
