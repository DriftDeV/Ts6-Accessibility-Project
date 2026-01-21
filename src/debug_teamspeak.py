from ts_master import launch_teamspeak, get_os_info

if __name__ == "__main__" : 
    os_info = get_os_info()
    print(f"[DEBUG] Lanciato Teamspeak in modabilità debug ")
    launch_teamspeak(os_info)
    exit()

