import sqlite3

conn = sqlite3.connect('users.db')
cursor = conn.cursor()

cursor.execute("DELETE FROM temp_details")
conn.commit()

conn.close()
