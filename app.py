from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify  # ✅ added session
import sqlite3
from flask_session import Session  
import stripe
import random 
from datetime import datetime
import smtplib
from email.message import EmailMessage

import os
from dotenv import load_dotenv
load_dotenv()
from twilio.rest import Client
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
stripe.api_key = os.getenv("STRIPE_API_KEY")
# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


app.config.update({
    'MAIL_SERVER':   'smtp.gmail.com',
    'MAIL_PORT':     587,
    'MAIL_USE_TLS':  True,
    'MAIL_USERNAME': os.getenv("MAIL_USERNAME"),
    'MAIL_PASSWORD': os.getenv("MAIL_PASSWORD")
})

def send_email_otp(to_email, otp):
    msg = EmailMessage()
    msg['Subject'] = 'Your OTP for CityRide'
    msg['From']    = app.config['MAIL_USERNAME']
    msg['To']      = to_email
    msg.set_content(f'Your OTP is: {otp}')

    try:
        with smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT']) as server:
            server.starttls()
            server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
            server.send_message(msg)
        return True
    except Exception as e:
        print("Email send failed:", e)
        return False



@app.route('/admin/send-phone-otp', methods=['POST'])
def admin_send_phone_otp():
    data = request.get_json(force=True)
    full = data.get('phone')
    if not full:
        return jsonify({'success': False, 'message': 'Full phone number required'}), 400

    otp = str(random.randint(100000, 999999))
    session['admin_phone_otp']           = otp
    session['admin_phone_to_verify']     = full

    try:
        client.messages.create(
            body=f"Your OTP to update phone is: {otp}",
            from_=TWILIO_PHONE_NUMBER,
            to=full
        )
        return jsonify({'success': True})
    except Exception as e:
        print("SMS error:", e)
        return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500

@app.route('/admin/verify-phone-otp', methods=['POST'])
def admin_verify_phone_otp():
    data  = request.get_json(force=True)
    otp   = data.get('otp')
    phone = data.get('phone')
    if session.get('admin_phone_otp') != otp or session.get('admin_phone_to_verify') != phone:
        return jsonify({'success': False, 'message': 'Invalid OTP or phone'}), 400
    session['admin_phone_verified'] = True
    return jsonify({'success': True})
@app.route('/admin/update-phone', methods=['POST'])
def admin_update_phone():
    if not session.get('admin_phone_verified'):
        return jsonify({'success': False, 'message': 'Phone not verified'}), 400

    full_phone  = session.pop('admin_phone_to_verify')
    admin_email = session.get('email')  # Logged-in admin email

    try:
        conn = sqlite3.connect('users.db')
        c    = conn.cursor()
        c.execute("UPDATE admins SET phone_no = ? WHERE email = ?", (full_phone, admin_email))
        conn.commit()
        conn.close()

        # Clean up session
        session.pop('admin_phone_otp', None)
        session.pop('admin_phone_verified', None)

        return jsonify({'success': True})
    except Exception as e:
        print("DB error (update phone):", e)
        return jsonify({'success': False, 'message': 'Failed to update phone'}), 500


@app.route('/admin/send-email-otp', methods=['POST'])
def admin_send_email_otp():
    data       = request.get_json(force=True)
    email_addr = data.get('email')
    if not email_addr:
        return jsonify({'success': False, 'message': 'Email required'}), 400

    otp = str(random.randint(100000, 999999))
    session['admin_email_otp']        = otp
    session['admin_email_to_verify']  = email_addr

    if send_email_otp(email_addr, otp):
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500

@app.route('/admin/verify-email-otp', methods=['POST'])
def admin_verify_email_otp():
    data  = request.get_json(force=True)
    otp   = data.get('otp')
    email = data.get('email')
    if session.get('admin_email_otp') != otp or session.get('admin_email_to_verify') != email:
        return jsonify({'success': False, 'message': 'Invalid OTP or email'}), 400
    session['admin_email_verified'] = True
    return jsonify({'success': True})
@app.route('/admin/update-email', methods=['POST'])
def admin_update_email():
    if not session.get('admin_email_verified'):
        return jsonify({'success': False, 'message': 'Email not verified'}), 400

    new_email   = session.pop('admin_email_to_verify')
    admin_email = session.get('email')  # Logged-in admin email

    try:
        conn = sqlite3.connect('users.db')
        c    = conn.cursor()
        c.execute("UPDATE admins SET gmail = ? WHERE email = ?", (new_email, admin_email))
        conn.commit()
        conn.close()

        # Clean up session
        session.pop('admin_email_otp', None)
        session.pop('admin_email_verified', None)

        return jsonify({'success': True})
    except Exception as e:
        print("DB error (update email):", e)
        return jsonify({'success': False, 'message': 'Failed to update email'}), 500
@app.route('/register-send-otp', methods=['POST'])
def register_send_otp():
    data       = request.get_json(force=True)
    name       = data.get('name')
    email      = data.get('email')
    phone      = data.get('phone')
    booking_id = data.get('booking_id')

    session['reg_booking_id'] = booking_id

    if not all([name, email, phone]):
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    # ── Remove the “already registered” early return entirely ──

    otp = str(random.randint(100000, 999999))
    session['reg_otp']    = otp
    session['reg_name']   = name
    session['reg_email']  = email
    session['reg_phone']  = phone

    try:
        print("🔍 [DEBUG] Sending OTP to:", phone)
        print("🔐 [DEBUG] OTP generated:", otp)

        msg = client.messages.create(
            body=f"Your OTP for CityRide registration is: {otp}",
            from_=TWILIO_PHONE_NUMBER,
            to=phone
        )
        print("✅ [DEBUG] Twilio SMS sent. SID:", msg.sid)
        return jsonify({'success': True})
    except Exception as e:
        print("❌ [ERROR] Twilio failed to send OTP:", e)
        return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500
@app.route('/register-verify', methods=['POST'])
def register_verify():
    entered_otp   = request.form.get('otp')
    correct_otp   = session.get('reg_otp')

    if entered_otp != correct_otp:
        return jsonify({ 'success': False, 'message': 'Invalid OTP' }), 401

    name        = session.get('reg_name')
    email       = session.get('reg_email')
    phone       = session.get('reg_phone')
    booking_id  = session.pop('reg_booking_id', None)

    try:
        conn   = sqlite3.connect('users.db')
        cursor = conn.cursor()

        # 1) If phone not already in accounts, insert it
        cursor.execute("SELECT 1 FROM accounts WHERE phone_number = ?", (phone,))
        if cursor.fetchone() is None:
            cursor.execute(
                "INSERT INTO accounts (name, email, phone_number) VALUES (?, ?, ?)",
                (name, email, phone)
            )

        # 2) Always update temp_details with just the phone_number
        if booking_id:
            cursor.execute(
                "UPDATE temp_details SET phone_number = ? WHERE id = ?",
                (phone, booking_id)
            )

        conn.commit()
        conn.close()

        session.pop('reg_otp', None)
    except Exception as e:
        print("DB error during register_verify:", e)
        return jsonify({ 'success': False, 'message': 'Server error. Please try again.' }), 500

    # Always return JSON (no redirects)
    return jsonify({ 'success': True })


@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data       = request.get_json()
    booking_id = data.get('booking_id')
    amount     = float(data.get('amount'))

    # ←── NEW: save price in temp_details
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("UPDATE temp_details SET price = ? WHERE id = ?", (amount, booking_id))
    conn.commit()
    conn.close()

    # …then your existing Stripe logic…
    checkout_session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'eur',
                'product_data': { 'name': f"{data['car_type']} Ride" },
                'unit_amount': int(amount * 100),
            },
            'quantity': 1,
        }],
        mode='payment',
        metadata={'booking_id': booking_id},
        success_url=url_for('success', booking_id=booking_id, _external=True),
        cancel_url=url_for('cancel', _external=True),
    )
    return jsonify({'id': checkout_session.id})

 
    
@app.route('/send-registration-otp', methods=['POST'])
def send_registration_otp():
    data = request.get_json(force=True)
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')

    if not all([name, email, phone]):
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE phone = ?', (phone,))
    existing_user = cursor.fetchone()
    conn.close()

    if existing_user:
        return jsonify({'success': False, 'message': '❌ This phone number is already registered. Please log in.'})

    # ✅ Send OTP if phone not found
    otp = str(random.randint(100000, 999999))
    otp_store[phone] = otp
    session['reg_name'] = name
    session['reg_email'] = email
    session['reg_phone'] = phone

    try:
        client.messages.create(
            body=f"Your OTP for CityRide registration is: {otp}",
            from_=TWILIO_PHONE_NUMBER,
            to=phone
        )
        return jsonify({'success': True})
    except Exception as e:
        print("Twilio error (register):", e)
        return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500
    
@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json(force=True)
    phone = data.get('phone')
    name  = data.get('username')

    if not phone or not name:
        return jsonify({'success': False, 'message': 'Missing phone or name'}), 400

    otp = str(random.randint(100000, 999999))
    session['otp'] = otp
    session['otp_phone'] = phone
    session['username'] = name

    print("🔐 [DEBUG] OTP generated:", otp)
    print("📞 [DEBUG] For phone:", phone)

    try:
        client.messages.create(
            body=f"Your OTP for CityRide login is: {otp}",
            from_=TWILIO_PHONE_NUMBER,
            to=phone
        )
        print("✅ [DEBUG] OTP sent successfully to:", phone)
        return jsonify({'success': True})
    except Exception as e:
        print("❌ [ERROR] Twilio failed to send OTP:", e)
        return jsonify({'success': False, 'message': 'Failed to send SMS'}), 500
@app.route('/otp-login', methods=['POST'])
def otp_login():
    phone       = request.form.get('phone')
    entered_otp = request.form.get('otp')
    session_phone = session.get('otp_phone')
    correct_otp   = session.get('otp')

    if phone != session_phone:
        return "Invalid phone number", 401
    if entered_otp != correct_otp:
        return "Invalid OTP", 401

    # At this point, OTP is correct for that phone.
    # ────────────────────────────────────────────────
    # Look up the user’s email from the accounts table:
    conn   = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name, email FROM accounts WHERE phone_number = ?", (phone,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        # (Just in case—they must exist if you sent OTP to them earlier.)
        return "User record not found", 404

    db_name, db_email = row  # name = row[0], email = row[1]

    # Now store everything into session:
    session['user_type'] = 'user'
    session['name']      = db_name
    session['user']      = phone
    session['email']     = db_email    # ← NEW: put email into session

    session.pop('otp', None)
    session.pop('otp_phone', None)
    session.pop('username', None)
    return redirect(url_for('index'))


@app.route('/verify_phone', methods=['POST'])
def verify_phone():
    phone = request.form.get('phone')
    print("🔍 [DEBUG] /verify_phone called with phone:", phone)

    if not phone:
        print("❌ [DEBUG] No phone provided")
        return "❌ Phone number is required", 400

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM accounts WHERE phone_number = ?", (phone,))
    result = cursor.fetchone()
    conn.close()

    if result:
        print("✅ [DEBUG] Phone found in accounts:", phone)

        otp = str(random.randint(100000, 999999))
        session['otp'] = otp
        session['otp_phone'] = phone
        session['username'] = result[0]

        try:
            print("🔐 [DEBUG] OTP generated:", otp)
            msg = client.messages.create(
                body=f"Your OTP for CityRide login is: {otp}",
                from_=TWILIO_PHONE_NUMBER,
                to=phone
            )
            print("✅ [DEBUG] Twilio SMS sent. SID:", msg.sid)
            return jsonify({'success': True, 'message': 'OTP sent'})
        except Exception as e:
            print("❌ [ERROR] Twilio failed to send OTP:", e)
            return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500
    else:
        print("❌ [DEBUG] Phone not registered:", phone)
        return jsonify({'success': False, 'message': 'User not registered!'}), 200


@app.route('/enter-otp')
def show_otp_page():
    return render_template('otp.html')



@app.route('/success')
def success():
    booking_id = request.args.get('booking_id', type=int)
    if booking_id:
        conn = sqlite3.connect('users.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 1️⃣ Fetch the temp_details row for this booking_id
        cursor.execute("SELECT * FROM temp_details WHERE id = ?", (booking_id,))
        booking = cursor.fetchone()

        if booking:
            # 2️⃣ Decide which phone to store in ride_details:
            #    If the guest-flow already wrote phone_number into temp_details, use that;
            #    otherwise, fall back to session.get('user') (logged-in user’s phone).
            phone_to_save = booking['phone_number'] or session.get('user')

            # 3️⃣ Insert that booking into ride_details
            # Current date and time
            now = datetime.now()
            cur_date = now.strftime('%Y-%m-%d')
            cur_time = now.strftime('%H:%M:%S')
            print("DEBUG: session contents in /success →", dict(session))

            # Determine rider name/email from session
            if session.get('user_type') == 'user':
                rider_name  = session.get('name')
                rider_email = session.get('email')
            else:
                rider_name  = session.get('reg_name')
                rider_email = session.get('reg_email')

            # 3️⃣ Insert booking into ride_details with name, email, cur_date, cur_time
            cursor.execute("""
                INSERT INTO ride_details
                (trip_type, pickup, dropoff, ride_date,
                hour, minute, return_trip,
                return_date, return_time,
                passengers, phone_number,
                name, email, cur_date, cur_time, price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                booking['trip_type'],
                booking['pickup'],
                booking['dropoff'],
                booking['ride_date'],
                booking['hour'],
                booking['minute'],
                booking['return_trip'],
                booking['return_date'],
                booking['return_time'],
                booking['passengers'],
                phone_to_save,
                rider_name,
                rider_email,
                cur_date,
                cur_time,
                booking['price']
            ))
            conn.commit()
            # 4️⃣ Delete from temp_details now that it’s finalized
            cursor.execute("DELETE FROM temp_details WHERE id = ?", (booking_id,))
            conn.commit()

            # ────────────────────────────────────────────────────────────
            # 5️⃣ Build a “who just booked” message, including name/email/phone
            #
            #    ▶ If user is logged in (session['user_type']=='user'), read from session:
            if session.get('user_type') == 'user':
                    rider_name  = session.get('name')
                    # Try to read from session first
                    rider_email = session.get('email')
                    rider_phone = session.get('user')

                    # If session has no email (or it’s blank), fetch directly from accounts table:
                    if not rider_email:
                        q = "SELECT email FROM accounts WHERE phone_number = ?"
                        cursor.execute(q, (phone_to_save,))
                        row = cursor.fetchone()
                        rider_email = row[0] if row else None
            else:
                    # guest‐flow: we know reg_email was put into session by the OTP logic
                    rider_name  = session.get('reg_name')
                    rider_email = session.get('reg_email')
                    rider_phone = session.get('reg_phone')

            #    ▶ Now assemble the human-readable booking details
            trip_type    = booking['trip_type']
            pickup       = booking['pickup']
            dropoff      = booking['dropoff']
            ride_date    = booking['ride_date']
            hour         = booking['hour']
            minute       = booking['minute']
            return_trip  = booking['return_trip']
            return_date  = booking['return_date'] or "N/A"
            return_time  = booking['return_time'] or "N/A"
            passengers   = booking['passengers']
            price        = booking['price']

            # Format departure time as HH:MM
            depart_time = f"{int(hour):02d}:{int(minute):02d}"
            if return_trip:
                return_text = f"Yes (Return on {return_date} at {return_time})"
            else:
                return_text = "No"

            full_message = (
                f"🚖 New Ride Booked 🚖\n"
                f"User: {rider_name} ({rider_email}, {rider_phone})\n"
                f"Trip Type: {trip_type}\n"
                f"From: {pickup} → To: {dropoff}\n"
                f"Departure: {ride_date} at {depart_time}\n"
                f"Return Trip: {return_text}\n"
                f"Passengers: {passengers}\n"
                f"Price: €{price:.2f}"
            )

            # 6️⃣ Fetch all admins so we can notify each one
            cursor.execute("SELECT phone_no, gmail FROM admins")
            admins = cursor.fetchall()

            # 7️⃣ Send SMS + Email to every admin
            for admin in admins:
                admin_phone = admin['phone_no']
                admin_email = admin['gmail']
                print("🔍 [DEBUG] About to send SMS to:", repr(admin_phone))

                # 7a) Send SMS via Twilio
                try:
                    client.messages.create(
                        body=full_message,
                        from_=TWILIO_PHONE_NUMBER,
                        to=admin_phone
                    )
                    print(f"✅ Sent SMS to admin {admin_phone}")
                except Exception as sms_err:
                    print(f"❌ Failed to send SMS to {admin_phone}: {sms_err}")

                # 7b) Send Email via SMTP
                try:
                    msg = EmailMessage()
                    msg['Subject'] = 'New Ride Booking Notification'
                    msg['From']    = app.config['MAIL_USERNAME']
                    msg['To']      = admin_email
                    msg.set_content(full_message)

                    with smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT']) as server:
                        server.starttls()
                        server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
                        server.send_message(msg)

                    print(f"✅ Sent email to admin {admin_email}")
                except Exception as email_err:
                    print(f"❌ Failed to send email to {admin_email}: {email_err}")
        conn.close()
    # 8️⃣ Finally, render the same success page (with countdown)
    return render_template('success.html')




@app.route('/cancel')
def cancel():
    return "<h2>❌ Payment cancelled. Please try again.</h2>"



# 👇 Add this AFTER your cancel/success routes

# Paste your actual webhook secret here from Stripe dashboard
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@app.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        return '⚠️ Invalid signature', 400

    # ✅ Handle refund notification
    if event['type'] == 'charge.refunded':
        charge = event['data']['object']
        payment_id = charge['payment_intent']

        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute("UPDATE rides SET status = 'refunded' WHERE stripe_payment_id = ?", (payment_id,))
        conn.commit()
        conn.close()
        print(f"💸 Ride marked refunded for payment: {payment_id}")

    elif event['type'] == 'checkout.session.completed':
        print("✅ Payment confirmed (webhook event)")

        session_obj = event['data']['object']
        booking_id  = session_obj.get('metadata', {}).get('booking_id')

        if booking_id:
            conn = sqlite3.connect('users.db')
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # fetch the booking from temp_details
            cursor.execute("SELECT * FROM temp_details WHERE id = ?", (booking_id,))
            booking = cursor.fetchone()

            if booking:
                # insert into ride_details
                cursor.execute("""
                    INSERT INTO ride_details
                        (trip_type, pickup, dropoff, ride_date,
                         hour, minute, return_trip,
                         return_date, return_time,
                         passengers, phone_number)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    booking['trip_type'], booking['pickup'], booking['dropoff'], booking['ride_date'],
                    booking['hour'], booking['minute'], booking['return_trip'],
                    booking['return_date'], booking['return_time'],
                    booking['passengers'], booking['phone_number']
                ))

                # delete from temp_details
                cursor.execute("DELETE FROM temp_details WHERE id = ?", (booking_id,))
                conn.commit()
                print(f"📦 Moved booking {booking_id} from temp_details → ride_details")

            conn.close()

    return jsonify(success=True)


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')

        if not name or not email or not phone:
            return "❌ All fields are required", 400

        try:
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()

            cursor.execute('''
                INSERT INTO users (name, email, phone)
                VALUES (?, ?, ?)
            ''', (name, email, phone))

            conn.commit()
            conn.close()

            flash("✅ Registered successfully. Please login.")
            return redirect(url_for('login'))

        except sqlite3.IntegrityError:
            flash("⚠️ This phone or email is already registered.")
            return redirect(url_for('login'))

    return render_template('login.html')


@app.route('/')
def index():
    response = render_template(
        'index.html',
        name=session.get('name'),
        user_type=session.get('user_type')
    )
    # Prevent caching of this page
    resp = app.make_response(response)
    resp.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '-1'
    return resp


@app.route('/calculate-fare', methods=['POST'])
def calculate_fare():
    # Example dummy response — you can connect real logic later
    from flask import request, jsonify
    data = request.get_json()
    
    # Fake logic for demo
    fare = 25.50  # replace this with your actual fare calculation
    
    return jsonify({'fare': fare})


@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/ride-booking', methods=['GET', 'POST'])
def ride_booking():
    if request.method == 'POST':
        # 1. Get form data
        pickup      = request.form.get('pickup')
        trip_type   = request.form.get('trip_type')
        dropoff     = request.form.get('dropoff')
        ride_date   = request.form.get('date')
        hour        = request.form.get('hour')
        minute      = request.form.get('minute')
        passengers  = int(request.form.get('passengers'))
        return_trip = int(request.form.get('return_trip', 0))

        # 2. Save to temp_details
        conn   = sqlite3.connect('users.db')
        cursor = conn.cursor()

        # determine return_date & return_time only if return_trip == 1
        if return_trip:
            return_date = request.form.get('return_date')

            # read the two separate dropdown‐values
            rh = request.form.get('return_hour')    # e.g. "14"
            rm = request.form.get('return_minute')  # e.g. "30"
            if rh and rm:
                # ensure two‐digit formatting
                return_time = f"{rh.zfill(2)}:{rm.zfill(2)}"
            else:
                return_time = None
        else:
            return_date = None
            return_time = None

        cursor.execute('''
        INSERT INTO temp_details
            (trip_type, pickup, dropoff, ride_date,
             hour, minute, return_trip,
             return_date, return_time,
             passengers)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            trip_type,
            pickup,
            dropoff,
            ride_date,
            int(hour),
            int(minute),
            return_trip,
            return_date,
            return_time,
            passengers
        ))
        booking_id = cursor.lastrowid

        conn.commit()
        conn.close()

        # 3. Redirect back to ride-booking (same page) with booking_id
        return redirect(url_for('ride_booking', booking_id=booking_id))

    # ─── GET request ───
    # Fetch booking by ID if passed as query parameter
    booking_id = request.args.get('booking_id', type=int)
    booking    = None

    if booking_id:
        conn   = sqlite3.connect('users.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM temp_details WHERE id = ?", (booking_id,))
        booking = cursor.fetchone()
        conn.close()

    if booking is None:
        return "<h3 style='color:red;'>❌ Booking not found. Make sure booking_id is passed in URL.</h3>"

    # Fetch all car_type → price mappings to pass into JS on the template
    conn   = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT car_type, price FROM prices")
    rows = cursor.fetchall()
    conn.close()

    price_map = { row[0]: row[1] for row in rows }

    print("Redirecting to booking_id:", booking_id)
    return render_template(
        'ride-booking.html',
        booking=booking,
        price_map=price_map,
        mapbox_token=os.getenv("ACCESS_TOKEN_MAPBOX")
    )


@app.route('/booking-summary')
def booking_summary():
    temp_id = request.args.get('temp_id', type=int)
    if not temp_id:
        return "❌ Booking ID missing", 400

    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM temp_details WHERE id = ?", (temp_id,))
    booking = cursor.fetchone()
    conn.close()

    if booking is None:
        return "❌ Booking not found", 404

    return render_template('booking-summary.html', booking=booking)
@app.route('/admin-rides')
def admin_rides():
    page     = int(request.args.get('page', 1))
    sort_by  = request.args.get('sort_by', '')
    per_page = 10
    offset   = (page - 1) * per_page

    conn             = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    cursor           = conn.cursor()

    # 1. Total count (unchanged)
    cursor.execute("SELECT COUNT(*) FROM ride_details")
    total_rows  = cursor.fetchone()[0]
    total_pages = (total_rows + per_page - 1) // per_page

    # ✅ Updated to sort by datetime (already correct, kept as is)
    sort_options = {
        'date_asc':  'cur_date ASC, cur_time ASC',
        'date_desc': 'cur_date DESC, cur_time DESC',
        'price_desc':'price DESC',
        'price_asc': 'price ASC',
        'name':      'name COLLATE NOCASE ASC',
        'email':     'email COLLATE NOCASE ASC'
    }
    order_by = sort_options.get(sort_by, 'id DESC')

    query = f"""
        SELECT
            id,
            name,
            phone_number,
            email,
            cur_date,
            cur_time,
            pickup,
            dropoff,
            ride_date,
            hour,
            minute,
            return_date,
            return_time,
            trip_type,
            COALESCE(price, 0.0) AS price
        FROM ride_details
        ORDER BY {order_by}
        LIMIT ? OFFSET ?
    """
    cursor.execute(query, (per_page, offset))
    bookings = cursor.fetchall()
    conn.close()

    return render_template(
        'admin-rides.html',
        bookings=bookings,
        page=page,
        total_pages=total_pages,
        sort_by=sort_by
    )



@app.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json(force=True)
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM admins WHERE email = ? AND password = ?",
        (email, password)
    )
    admin = cursor.fetchone()
    conn.close()

    if admin:
        session['email']     = email
        session['name']      = admin[1]   # adjust index if needed
        session['user_type'] = 'admin'
        return jsonify({'success': True, 'redirect': url_for('index')})
    else:
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    
@app.route('/admin-bookings')
def admin_bookings():
    page = int(request.args.get('page', 1))
    per_page = 10

    bookings, total_pages = get_paginated_ride_bookings(page, per_page)

    return render_template(
        'admin_bookings.html',
        bookings=bookings,
        page=page,
        total_pages=total_pages
    )


def get_all_bookings():
    conn = sqlite3.connect('taxi_database.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings")
    rows = cursor.fetchall()
    conn.close()
    return rows
def get_paginated_admin_rides(page, per_page):
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    offset = (page - 1) * per_page

    cursor.execute("SELECT COUNT(*) FROM ride_details")
    total_rows = cursor.fetchone()[0]
    total_pages = (total_rows + per_page - 1) // per_page

    cursor.execute("""
        SELECT
            rd.id,
            ac.name AS customer,
            '-' AS driver,
            rd.pickup,
            rd.dropoff,
            rd.ride_date,
            rd.hour,
            rd.minute,
            COALESCE(rd.price, 0.0) AS price,
            'Completed' AS status
        FROM ride_details rd
        LEFT JOIN accounts ac ON rd.phone_number = ac.phone_number
        ORDER BY rd.id DESC
        LIMIT ? OFFSET ?
    """, (per_page, offset))

    bookings = cursor.fetchall()
    conn.close()
    return bookings, total_pages



@app.route('/admin-dashboard')
def admin_dashboard():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # ─── Stats ──────────────────────────────────────────────────────────────────
    cur.execute("SELECT COUNT(*) FROM ride_details")
    total_rides   = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM accounts")
    total_users   = cur.fetchone()[0]
    cur.execute("SELECT COALESCE(SUM(price),0) FROM ride_details")
    total_revenue = cur.fetchone()[0]

    # ─── Recent bookings (now including name, email, trip_type, etc.) ────────────
    cur.execute("""
        SELECT
            id,
            name,
            email,
            phone_number,
            cur_date,
            cur_time,
            pickup,
            dropoff,
            ride_date,
            hour,
            minute,
            return_date,
            return_time,
            trip_type,
            COALESCE(price, 0.0) AS price
        FROM ride_details
        ORDER BY id DESC
        LIMIT 10
    """)
    bookings = cur.fetchall()
    conn.close()

    return render_template(
        'admin-dashboard.html',
        bookings=bookings,
        total_rides=total_rides,
        total_users=total_users,
        total_revenue=total_revenue
    )




@app.route('/admin-logout')
def admin_logout():
    session.pop('admin', None)
    return redirect(url_for('login'))  # or 'index' or wherever you want


@app.route('/vehicle-booking-data')
def vehicle_booking_data():
    conn = sqlite3.connect('taxi_database.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT vehicle_type, COUNT(*) FROM vehicle_bookings GROUP BY vehicle_type
    ''')
    data = cursor.fetchall()
    conn.close()

    labels = [row[0] for row in data]
    counts = [row[1] for row in data]

    return jsonify({'labels': labels, 'counts': counts})


@app.route('/booking-confirmation')
def booking_confirmation():
    return render_template('booking-confirmation.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

def get_db_connection():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    return conn




@app.route('/driver-dashboard')
def driver_dashboard():
    return render_template('dashboard_drivers.html', current_date=datetime.today().strftime('%B %d, %Y'))


@app.route('/driver-logout')
def driver_logout():
    session.pop('driver_id', None)
    return redirect(url_for('login'))  # <-- go to login.html



@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/fleet')
def fleet():
    return render_template('fleet.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            return "❌ Email and Password are required"

        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", (email, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            session['email'] = email
            session['name'] = user[1]   # assuming user[1] = name
            session['user_type'] = 'user'
            return redirect(url_for('index'))  # ✅ Redirect to home
        else:
            return "❌ Invalid email or password"

    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()  # ✅ removes everything: email, name, user_type
    return redirect(url_for('index'))  # ✅ go back to home


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/update-location', methods=['POST'])
def update_location():
    if 'email' not in session:
        return redirect(url_for('login'))

    label = request.form['label']
    address = request.form['address']
    email = session['email']

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Insert or Update logic
    cursor.execute('''
        INSERT INTO saved_locations (user_email, label, address)
        VALUES (?, ?, ?)
        ON CONFLICT(user_email, label) DO UPDATE SET address = excluded.address
    ''', (email, label, address))

    conn.commit()
    conn.close()

    return redirect(url_for('user_dashboard'))


@app.route('/admin/pricing', methods=['GET', 'POST'])
def admin_pricing():
    if request.method == 'POST':
        print("🚨 POST request received")

        vehicle_type = request.form.get('vehicle_type')
        vehicle_price = request.form.get('vehicle_price')

        print(f"📥 Received: vehicle_type = {vehicle_type}, vehicle_price = {vehicle_price}")

        if vehicle_type and vehicle_price:
            try:
                conn = sqlite3.connect('users.db')
                cursor = conn.cursor()

                query = "UPDATE prices SET price = ? WHERE car_type = ?"
                print(f"🛠 Running query: {query} with values = {vehicle_price}, {vehicle_type}")
                cursor.execute(query, (vehicle_price, vehicle_type))

                conn.commit()

                print("✅ DB updated successfully")

                # Fetch back to verify
                cursor.execute("SELECT * FROM prices")
                row = cursor.fetchone()
                print("🧾 Current row:", row)

                conn.close()
            except Exception as e:
                print("❌ Exception during DB update:", e)
        else:
            print("⚠️ vehicle_type or vehicle_price was empty or missing!")

        return redirect(url_for('admin_pricing'))

    print("📄 GET request — rendering pricing page")
    return render_template('admin-pricing.html')

@app.route('/admin-notifications')
def admin_noti():
    return render_template('admin-noti.html')

@app.route('/user-dashboard')
def user_dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))

    phone = session['user']
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1️⃣ Get the user’s name from accounts
    cursor.execute(
        "SELECT name FROM accounts WHERE phone_number = ?",
        (phone,)
    )
    row = cursor.fetchone()
    name = row['name'] if row else 'User'

    # 2️⃣ Count total rides in ride_details
    cursor.execute(
        "SELECT COUNT(*) AS cnt FROM ride_details WHERE phone_number = ?",
        (phone,)
    )
    total_rides = cursor.fetchone()['cnt']

    # 3️⃣ Sum total spent (price) in ride_details
    cursor.execute(
        "SELECT COALESCE(SUM(price),0) AS sum_price FROM ride_details WHERE phone_number = ?",
        (phone,)
    )
    total_spent = cursor.fetchone()['sum_price']

    # 4️⃣ (Optional) Keep total_distance from users table if you still want to show it
    cursor.execute(
        "SELECT total_distance FROM users WHERE phone = ?",
        (phone,)
    )
    row2 = cursor.fetchone()
    total_distance = row2[0] if row2 else '-'

    cursor.execute("""
        SELECT
          id,
          trip_type,
          pickup,
          dropoff,
          ride_date, hour, minute,
          return_trip, return_date, return_time,
          price
        FROM ride_details
        WHERE phone_number = ?
        ORDER BY id DESC
    """, (phone,))
    rows = cursor.fetchall()

    bookings = []
    for r in rows:
        # format date & time into one string
        dt = f"{r['ride_date']} {int(r['hour']):02d}:{int(r['minute']):02d}"
        # simple status logic (you can adjust)
        status = 'Round-trip' if r['return_trip'] else 'One-way'
        price = r['price']
        if not price:
            price = 0
        bookings.append({
            'booking_id':  r['id'],
            'customer':    name,                   # same user name every row 
            'from':        r['pickup'],
            'to':          r['dropoff'],
            'date_time':   dt,
            'status':      status,
            'amount':      price
        })

    conn.close()

    user_data = {
        "name":           name,
        "total_rides":    total_rides,
        "total_distance": total_distance,
        "total_spent":    total_spent
    }

    return render_template(
        'user-dashboard.html',
        user=user_data, 
        bookings=bookings,
    )



if __name__ == '__main__':
    app.run(debug=True)
