
/**
 * Anthony Martinez
 * CECS 478
 * Prof Dr. Aliasgari
 * Small android app to show/test enc/dec

 */

package com.example.tony.crypto;

import android.content.Context;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import com.example.tony.crypto.EncDec.*;
import com.google.gson.Gson;

public class EncryptDecrypt extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_encrypt_decrypt);


        final EditText hello = (EditText) findViewById(R.id.helloText);
        final TextView scramble = (TextView) findViewById(R.id.answer);
        Button enc = (Button)findViewById(R.id.encryptbutton);
        Button dec =  (Button)findViewById(R.id.decryptbutton);


        enc.setOnClickListener(new View.OnClickListener(){

            Keys data;
            Context c = getApplicationContext();
            @Override
            public void onClick(View v){

                Encrypt enc = new Encrypt();
                String message="";//message to return
                Gson gson = new Gson();
                data = gson.fromJson(enc.Enc(hello.getText().toString(),c ), Keys.class);

                scramble.setText(
                        "rsa:   " + data.getRsa() + "\n\n" +
                        "hamc:  " + data.getHmac() + "\n\n" +
                        "ivaes: " + data.getIvaes());
                Log.d("", "onClick: "+ data.getRsa());
            }
        } );

        dec.setOnClickListener(new View.OnClickListener(){

            Context c = getApplicationContext();
            @Override
            public void onClick(View v){
                Encrypt enc = new Encrypt();
                String obj = enc.Enc(hello.getText().toString(),c );
                String hello1 = enc.Dec(obj,c);
                scramble.setText(hello1);
            }
        } );



    }



}
