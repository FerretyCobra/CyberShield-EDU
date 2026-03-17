import mysql.connector
import sys

try:
    conn = mysql.connector.connect(host='localhost', user='root', password='')
    cursor = conn.cursor()
    
    with open('setup_xampp.sql', 'r', encoding='utf-8') as f:
        sql_commands = f.read().split(';')
        
    for command in sql_commands:
        if command.strip():
            cursor.execute(command)
            
    conn.commit()
    print("Database tables initialized successfully.")
    sys.exit(0)
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()
