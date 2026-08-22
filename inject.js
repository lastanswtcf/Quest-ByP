(async function() {
  try {
    let isDesktop = typeof DiscordNative !== 'undefined' && DiscordNative !== null;
    if (!isDesktop) {
      const versions = [
        { version: '1.0.9150', build: '301234', electron: '29.4.0', chrome: '122.0.0.0' },
        { version: '1.0.9145', build: '300891', electron: '29.2.0', chrome: '121.0.0.0' },
        { version: '1.0.9140', build: '300456', electron: '28.3.0', chrome: '120.0.0.0' },
        { version: '1.0.9135', build: '300123', electron: '27.4.0', chrome: '119.0.0.0' }
      ];
      
      const v = versions[Math.floor(Math.random() * versions.length)];
      
      window.DiscordNative = {
        isRenderer: true,
        os: 'win32',
        app: {
          getVersion: () => v.version,
          getBuildNumber: () => v.build
        },
        process: {
          getCPUUsage: () => (Math.random() * 20 + 5).toFixed(1),
          getMemoryUsage: () => Math.floor(Math.random() * 400 + 200)
        }
      };
    }
    
    if (window.webpackChunkdiscord_app) {
      try {
        const mods = window.webpackChunkdiscord_app.push([[Symbol()], {}, (r) => r]);
        window.webpackChunkdiscord_app.pop();
        const spMod = Object.values(mods.c).find(
          m => m?.exports?.getSuperProperties || m?.exports?.getSuperPropertiesBase
        );
        
        if (spMod?.exports) {
          const orig = spMod.exports.getSuperProperties || spMod.exports.getSuperPropertiesBase;
          
          if (orig) {
            spMod.exports.getSuperProperties = function() {
              const p = orig.apply(this, arguments) || {};
              
              if (!p.os || p.os === 'Web' || p.os === 'linux') {
                const os = ['Windows', 'Windows', 'Windows', 'macOS'];
                p.os = os[Math.floor(Math.random() * os.length)];
              }
              
              if (!p.browser || p.browser === 'Discord Web') {
                p.browser = 'Discord Desktop';
              }
              
              if (!p.client_build_number || p.client_build_number === '0') {
                const builds = ['301234', '300891', '300456', '300123'];
                p.client_build_number = builds[Math.floor(Math.random() * builds.length)];
              }
              
              if (!p.browser_user_agent || p.browser_user_agent.includes('Linux')) {
                const elec = ['29.4.0', '29.2.0', '28.3.0', '27.4.0'];
                const chrom = ['122.0.0.0', '121.0.0.0', '120.0.0.0', '119.0.0.0'];
                const e = elec[Math.floor(Math.random() * elec.length)];
                const c = chrom[Math.floor(Math.random() * chrom.length)];
                p.browser_user_agent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9150 Chrome/${c} Electron/${e} Safari/537.36`;
              }
              
              if (!p.os_version) {
                p.os_version = '10.0.19045';
              }
              
              p.client_event_source = 'desktop';
              
              return p;
            };
          }
        }
      } catch (e) {}
    }
    
    delete window.$;
    
    let w = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]);
    webpackChunkdiscord_app.pop();
    let qs = Object.values(w.c).find(x => x?.exports?.A?.__proto__?.getQuest)?.exports?.A;
    let api = Object.values(w.c).find(x => x?.exports?.Bo?.get)?.exports?.Bo;
    
    if (!qs || !api) {
      console.log('required stores not found');
      return;
    }
    
    let now = Date.now();
    let types = ['WATCH_VIDEO', 'WATCH_VIDEO_ON_MOBILE'];
    let quest = null;
    let type = null;
    let all = [...qs.quests.values()];
    let active = all.filter(q => 
      q.userStatus?.enrolledAt && 
      !q.userStatus?.completedAt && 
      new Date(q.config.expiresAt).getTime() > now
    );
    
    if (active.length === 0) {
      console.log('no active uncompleted quests');
      return;
    }
    
    for (let q of all) {
      if (!q.userStatus?.enrolledAt || q.userStatus?.completedAt) continue;
      if (new Date(q.config.expiresAt).getTime() <= now) continue;
      
      let cfg = q.config.taskConfig ?? q.config.taskConfigV2;
      if (!cfg) continue;
      
      let tasks = cfg.tasks || {};
      let found = types.find(t => tasks[t] != null);
      
      if (found) {
        quest = q;
        type = found;
        break;
      }
    }
    
    if (!quest || !type) {
      console.log('no active watch video quest found');
      return;
    }
    
    let target = quest.config.taskConfig?.tasks?.[type]?.target ?? 
                 quest.config.taskConfigV2?.tasks?.[type]?.target;
    let done = quest.userStatus?.progress?.[type]?.value || 0;
    let name = quest.config.application?.name || quest.config.messages?.questName || 'unknown';
    
    console.log('quest ' + (quest.config.messages?.questName || 'unnamed') + 
                ' type ' + type + ' target ' + target + 's progress ' + done + 's');
    
    let enrolled = new Date(quest.userStatus.enrolledAt).getTime();
    let speed = 6 + Math.random() * 3;
    let interval = 0.8 + Math.random() * 0.4;
    let max_future = 8 + Math.random() * 4;
    console.log('starting video spoof for ' + name);
    let done_flag = false;
    let count = 0;
    let errors = 0;
    let max_errors = 5;
    let timeout = Date.now() + 600000;
    
    while (!done_flag && Date.now() < timeout) {
      let max_allowed = Math.floor((Date.now() - enrolled) / 1000) + max_future;
      let diff = max_allowed - done;
      let ts = done + speed;
      
      if (done >= target - 1) {
        console.log('progress near target, forcing final requests');
        for (let i = 0; i < 2; i++) {
          try {
            await api.post({
              url: '/quests/' + quest.id + '/video-progress',
              body: { timestamp: target }
            });
            count++;
            console.log('[' + count + '] final push ' + target + '/' + target + 's');
            let wait = 500 + Math.random() * 300;
            await new Promise(r => setTimeout(r, wait));
          } catch (e) {
            console.log('final push error ' + e.message);
            errors++;
          }
        }
        done_flag = true;
        break;
      }
      
      if (diff >= speed) {
        let send = Math.min(target, ts + Math.random() * 0.7);
        
        try {
          await api.post({
            url: '/quests/' + quest.id + '/video-progress',
            body: { timestamp: send }
          });
          
          done = Math.min(target, ts);
          count++;
          errors = 0;
          
          console.log('[' + count + '] progress ' + Math.round(send) + '/' + target + 's');
        } catch (e) {
          console.log('video progress error ' + e.message);
          errors++;
          if (errors >= max_errors) {
            console.log('too many errors, stopping');
            break;
          }
        }
      }
      
      if (done >= target) {
        console.log('quest completed - progress reached target');
        done_flag = true;
        break;
      }
      
      let wait = interval * 1000 + Math.random() * 400;
      await new Promise(r => setTimeout(r, wait));
    }
    
    if (Date.now() >= timeout) {
      console.log('timeout reached after 10 minutes');
    }
    
    try {
      let verify = await api.get({ url: '/quests/' + quest.id });
      if (verify?.userStatus?.completedAt) {
        console.log('quest verified complete');
        done_flag = true;
      } else {
        console.log('quest not complete - progress: ' + (verify?.userStatus?.progress?.[type]?.value || 0) + '/' + target);
      }
    } catch (e) {
      console.log('verify error: ' + e.message);
    }
    
    if (done_flag) {
      console.log('done - ' + count + ' requests sent');
    } else {
      console.log('stopped - check quest status manually');
    }
    
  } catch (err) {
    console.log('script error ' + err.message);
  }
})();
