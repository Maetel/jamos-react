import Window from "../components/Window";
import JamOS from "../features/JamOS/JamOS";
import { closeToolbar } from "../features/procmgr/procSlice";
import SetMgr, { settingDescription } from "../features/settings/SetMgr";
import styles from "../styles/Settings.module.css";

export default function Settings(props) {
  const setmgr = JamOS.setmgr;
  const settings = setmgr.getAllReadable();
  const colors = JamOS.theme.colors;

  const proc = { ...props.proc };
  proc.name = proc.name ?? "Settings";
  proc.hideNav = true;
  let viewId = 1;

  const buildView = (settings) => {
    const retval = [];
    for (let key in settings) {
      retval.push({
        id: viewId++,
        key: key,
        value: settings[key],
      });
    }
    return [...retval];
  };
  const settingsView = buildView(settings);

  const saveBread = (forceSave: boolean = false) => {
    JamOS.saveData("breadData", JamOS.stringify());
  };
  const loadBread = (forceSave: boolean = false) => {
    const d = JamOS.loadData("breadData");
    if (d) {
      JamOS.loadFromString(d);
    }
  };

  const toggleBoolean = (key: string) => {
    setmgr.toggleBoolean(key);
  };

  return (
    <Window {...props} proc={proc}>
      <div className={`${styles.container}`}>
        <h1>Settings</h1>
        <div className={`${styles["settings-container"]}`}>
          <div className={`${styles.buttons}`}>
            <button
              className={`${styles.btn} ${styles.save}`}
              onClick={() => {
                saveBread();
                JamOS.setNotif("Saved", "system");
              }}
            >
              Save
            </button>
            <button
              className={`${styles.btn} ${styles.load}`}
              onClick={() => {
                loadBread();
                JamOS.setNotif("Loaded", "system");
              }}
            >
              Load
            </button>
            <button
              className={`${styles.btn} ${styles.reset}`}
              onClick={() => {
                JamOS.reset();
                // resetSaved();
                // resetted = true;
              }}
            >
              Reset
            </button>
          </div>

          <div className={`${styles.item}`}>
            <div className={`${styles.l} ${styles.head}`}>Name</div>
            <div className={`${styles.r} ${styles.head}`}>Value</div>
          </div>

          {settingsView.map((setting, id) => {
            return (
              <div className={styles.item} key={id}>
                <div className={styles.l}>
                  {settingDescription[setting.key]}
                </div>
                {typeof setting.value === "boolean" ? (
                  <div className={styles.r}>
                    <div
                      className={styles.toggler}
                      onClick={() => {
                        toggleBoolean(setting.key);
                        // saveSettings();
                      }}
                    >
                      {setting.value ? (
                        <img
                          src="/imgs/circlecheck.svg"
                          alt={`${settingDescription[setting.key]} being ${
                            setting.value
                          }`}
                          className={`${styles["toggle-icon"]}`}
                          style={{
                            backgroundColor: colors.okay,
                          }}
                        />
                      ) : (
                        <img
                          src="/imgs/circlex.svg"
                          alt={`${settingDescription[setting.key]} not ${
                            setting.value
                          }`}
                          className={`${styles["toggle-icon"]}`}
                          style={{
                            backgroundColor: colors.warn,
                          }}
                        />
                      )}
                    </div>
                  </div>
                ) : undefined}

                {typeof setting.value === "string" ? (
                  <div className={`${styles["string-setting"]} ${styles.r}`}>
                    {setting.value}
                  </div>
                ) : undefined}

                {typeof setting.value === "number" ? (
                  <div className={`${styles["number-setting"]} ${styles.r}`}>
                    {setting.value}
                  </div>
                ) : undefined}
              </div>
            );
          })}
        </div>
      </div>
    </Window>
  );
}
